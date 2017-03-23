/**
 * Created by EX-pengzhiliang001 on 2017-03-22.
 */
;(function (factory) {
    if (typeof define == 'function' && define.amd) {
        //seajs or requirejs environment
        define(['jquery', 'class', 'pager'], factory);
    } else if (typeof module === 'object' && typeof module.exports == 'object') {
        module.exports = factory(
            require('jquery'),
            require('class'),
            require('pager')
        );
    } else {
        factory(window.jQuery, window.jQuery.klass);
    }
})(function ($, Class) {

    var EVENTS=[],
        OPT_FILTER_ARGS=['columns'],
        LIGER_COLUMNS_OPT_NAMES={
            key:"name",
            label:"display",
            columns:"columns",
            sort:"sort",
            width:"width",
            fixed:"frozen",
            format:"render",
            headerFormat:"headerRender"
        },
        LIGER_OPT_NAMES=[];

    /*过滤参数
    * @param {object} 需要过滤的对象
    * */
    function _handleFilterOptions(needFilter){
        var obj={};

        for (var i in needFilter){

            if(OPT_FILTER_ARGS.indexOf(i)>-1){
                obj[i]=needFilter[i];
            }else{
                continue;
            }
        }

        return obj;
    }

    /*参数转换
    * @param {object} 需要转换的对象
    * */
    function _optToLigerOpt(changeObj){
        var obj={};

        for (var i in changeObj){
            if(i=="columns"){
                obj["columns"]=[];
                if(changeObj[i].length>0){
                    for (var m in changeObj[i]){

                        obj["columns"].push(_optToLigerOpt(changeObj[i][m]));
                    }
                }else{
                    obj["columns"].push(changeObj["columns"]);
                }
            }else{
                for(var k in LIGER_COLUMNS_OPT_NAMES){
                    if(i==k){
                        obj[LIGER_COLUMNS_OPT_NAMES[k]]=changeObj[i];
                    }
                }

            }
        }

        return obj;
    }

    return Class.$factory('datagrid', {

        initialize:function (option) {
            this.ele=$(option.dom);
            this.grid="";
            this.default={
                ligerOpt:{},
                reqData:option.source.requestData||{},
                url:option.source.ajaxUrl||"",
                type:option.source.type||"",
                totalField:option.source.dataTotal||"",
                pagerConfig:{
                    total: "",
                    current: "",
                    showFirstBtn: false
                }
            };

            this.default.ligerOpt=_handleFilterOptions(option);

            this.handleOptColumns();

            this.opt = $.extend({}, this.default,option);
            this.createDataGrid();
        },

        /*处理参数columns*/
        handleOptColumns:function(){

            var styleObj={
                // rowHeight:36,
                usePager:false,
                headerRowHeight:42,
                width: '100%',
                height: '100%'
            };

            this.default.ligerOpt= $.extend({}, this.default.ligerOpt,styleObj);

            for ( var i in this.default.ligerOpt.columns){
                this.default.ligerOpt.columns[i]=_optToLigerOpt(this.default.ligerOpt.columns[i]);
            }

        },

        /*处理参数source*/
        handleOptSource:function (){


        },


        /*创建table*/
        createDataGrid:function (){
            var _self=this;

            _self.grid=_self.ele.ligerGrid(_self.opt.ligerOpt);

            _self.getTableData();
        },

        /*ajax请求
        *  @param {Object} reqData 请求参数
        *  @param {String} url 请求链接
        *  @param {String} type 请求类型
        *  @param {Function} fn 请求成功之后执行
        * */
        getTableData:function(){
            var  _self= this ;
            console.log(_self.opt.url,13123);

            $.ajax({
                url:_self.opt.url,
                type:_self.opt.type,
                data:_self.opt.reqData,
                dataType:"json",
                success:function(data){
                    console.log(data);
                    _self.trigger('xhrsuccess', data);
                    _self.grid.set({data:data});
                    // _self.grid.loadData();
                    _self.opt.pagerConfig.total=Math.ceil(eval("data."+_self.opt.totalField) / page.perPage);


                    // _self.createTablePager();
                }
            })
        },


        /*创建pager*/
        createTablePager:function(){
            var _self=this;
            _self.ele.append("<div class='pager'></div>");
            _self.ele.find(".pager").pager({
                // total: page.total/page.perPage,
                total: Math.ceil(dataTotal / page.perPage),
                current: source.requestData ? (source.requestData[ipageFeild] ? source.requestData[ipageFeild] : 1) : [],
                showFirstBtn: false
            }).on("pager:switch", function (event, index) {

            })
        },


        /*销毁grid*/
        destroy:function () {

        },

        /*时间监听*/
        handleEvent:function () {

        }


    })

});
