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
        OPT_LIGER_FILTER_ARGS=['columns','height','children'],
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

            if($.inArray(i, OPT_LIGER_FILTER_ARGS) !== false){
                obj[i] = needFilter[i];
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

    /*检查某个从参数是否为true
    * @param {checkObj} 被检查的对象
    * @param {field} 被检查的字段
    * @param {field} 递归字段
    * */
    function _checkObjFieldIsTrue (checkObj,field,colField){
        var fixed=false;
        console.log(checkObj,field,colField)
        for (var  i in checkObj){
            if(i==colField&&colField.length>0){
                isTrue=_checkObjFieldIsTrue(checkObj[i],"frozen","columns");
            }else{
                if(i==field && checkObj[i]==true){
                    console.log(checkObj[i]);
                    return true;
                }
            }
        }
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
                totalField:option.source.dataTotalField||"",
                perPager:option.source.perPager||"",
                currentPagerField:option.source.currentPageField||"",
                dataRowsField:option.source.dataRowsField||"",
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

            var ligerObj={
                rowHeight:36,
                usePager:false,
                headerRowHeight:42,
                width: '100%',
                // height: 500,
                detail: {onShowDetail:this.default.ligerOpt.children},


                columnWidth: 100
            };

            this.default.ligerOpt= $.extend(true,{}, this.default.ligerOpt,ligerObj);

            delete this.default.ligerOpt.children;
            console.log(this.default.ligerOpt);

            for ( var i in this.default.ligerOpt.columns){
                this.default.ligerOpt.columns[i]=_optToLigerOpt(this.default.ligerOpt.columns[i]);
            }

        },

        /*处理参数source*/
        handleOptSource:function (){

        },


        /*检查是否有固定列*/
        checkColumnsFixed:function (){
            var fixed=false;
            for ( var i in this.default.ligerOpt.columns) {
                fixed=_checkObjFieldIsTrue(this.default.ligerOpt.columns[i], "frozen", "columns");
                if(fixed)break;
            }

            console.log(fixed,92992);

            if(fixed){
                this.ele.find(".l-grid2").css({marginLeft:"3px"});
            }
        },


        /*创建table*/
        createDataGrid:function (){
            var _self=this;

            _self.grid=_self.ele.ligerGrid(_self.opt.ligerOpt);
            this.checkColumnsFixed();

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
            console.log(_self.opt,13123);

            $.ajax({
                url:_self.opt.url,
                type:_self.opt.type,
                data:_self.opt.reqData,
                dataType:"json",
                success:function(data){

                    console.log(data,_self.opt.totalField ,_self.opt.perPager,848484);
                    _self.trigger('xhrsuccess', data);

                    var rows={
                        Rows:eval("data."+_self.opt.dataRowsField)
                    };
                    console.log(rows,54545445);
                    _self.grid.set({data:rows});
                    // _self.grid.loadData();

                    var per="";
                    if(parseInt(_self.opt.perPager)>0){
                        per=_self.opt.perPager;
                    }else{
                        per=_self.opt.reqData[_self.opt.perPager];
                    }

                    _self.opt.pagerConfig.total=Math.ceil(eval("data."+_self.opt.totalField) / per);
                    _self.opt.pagerConfig.current=_self.opt.reqData[_self.opt.currentPagerField];

                    _self.createTablePager();
                },
                error:function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest, textStatus, errorThrown,7747474);
                }
            })
        },


        /*创建pager*/
        createTablePager:function(){
            var _self=this;
            if(_self.ele.children(".pager").length==0){
                _self.ele.append("<div class='pager'></div>");
            }

            _self.ele.find(".pager")
                .pager(_self.opt.pagerConfig)
                .off("pager:switch")
                .on("pager:switch", function (event, index) {
                    _self.opt.reqData[_self.opt.currentPagerField]=index;
                    _self.getTableData();
                })
        },


        /*销毁grid*/
        destroy:function () {

        },

        /*事件监听*/
        handleEvent:function () {

        }


    })

});
