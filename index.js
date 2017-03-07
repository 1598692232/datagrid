;(function (factory) {
    if (typeof define == 'function' && define.amd) {
        //seajs or requirejs environment
        define(['jquery','class','pager',"./dataTables.js","./dataTables.fixedColumns.min.js"], factory);
    } else if (typeof module === 'object' && typeof module.exports == 'object') {
        module.exports = factory(
            require('jquery'),
            require('class'),
            require('pager'),
            require("./jquery.dataTables.js"),
            require("./dataTables.fixedColumns.js")
        );
    } else {
       factory(window.jQuery);
    }
})(function ($) {

    var dataTables=function (ele,option){
          this.ele=ele;
          this.default={};
          this.opt=$.extend({},option,this.default);
          this.init();
    };

    var dt=dataTables.prototype;

    // 表头初始化
    dt.init=function(){

        if(this.opt.keys==undefined||this.opt.keys.length==0)return;

        var footerThArgs=this.opt.keys.map(function(item,index){
          return "<th>"+item+"</th>";
        });

        var tableHtml='<table cellspacing="0" width="100%">'+
                          '<thead>'+
                          '<tr>'+
                            footerThArgs.join("")+
                          '</tr>'+
                          '</thead>'+
                          '</table>'+
                          '<div id="'+this.opt.pager+'">'+
                          '</div>';
        this.ele.html(tableHtml);
        return this;
    };

    //完全使用dataTable插件
    dt.createData=function(options){
        this.ele.find("table").DataTable(options);
        return this;
    };

    //创建页码
    dt.createPager=function(options){
      $("#"+this.opt.pager).pager(options.opt).on(options.eventName, options.eventBack);
      return this;
    };

    //销毁datatable
    dt.destory=function(){
        this.ele.find("table").length>0 && this.ele.html("");
    };

    //新增jquery扩展函数dataTables
    $.fn.dataTables = function (option) {
        return new dataTables(this,option);
    };

});
