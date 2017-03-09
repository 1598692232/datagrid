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
    /*ajax重写为source*/
    const CAN_FIELDS=['columns','pagerOptionsFormat','source','itemFormat'];

    /*为datagrid提供方法*/
    var dtValidate={
        colsObj:{},  /*每列对象*/
        // allColsArgs:{},
        everyColsObj:{},    /*获取columns的每个对象属性*/
        // ceng:0,
        group:{},         /*中间转换对象group*/
        // finalArgs:{},
        rowIndexArgs:[],  /*tr的键值*/
        trArgs:{},    /*z最终渲染的tr的对象*/
        maxTrLength:0,    /*最大行数*/
        /*过滤不必要的字段*/
        filter:function (fields){

            var keys=fields instanceof Object? Object.keys(fields):"";

            keys.map(function(v,k){
                if(CAN_FIELDS.indexOf(v)==-1){
                    delete fields[v];
                    return null;
                }else{
                    return v;
                }
            });

            return fields;

        },
        /*获取列数对象*/
        allColsObj:function (columns,totalColsArgs,totalCols,final,parentKey){
            var _self=this;

            columns.forEach(function(v,k){
                /*获取分类跨列数*/
                var obj={
                    length:v.columns.length,
                    parent:parentKey,
                    label:v.label,
                    className:v.className,
                    key:v.key
                };

                _self.everyColsObj[v.key]=obj;


                if(v.columns!=undefined&&v.columns instanceof Array&&v.columns.length>0){
                    // ++totalCols;
                    // totalColsArgs[final]=totalCols;
                    // console.log( _self.colsObj,_self.everyColsObj,_self.allColsArgs);
                    // console.log(_self.everyColsObj);
                    // return totalCols;
                    // return totalColsArgs;
                    // }else{
                    _self.allColsObj(v.columns,totalColsArgs,totalCols,k,parentKey==undefined?v.key:parentKey+','+v.key);
                }
            });

        },


        /*获得总数*/
        getTotalCols:function(){
            var allNum=0;

            for(var k in this.colsObj){
                allNum+=this.colsObj[k];
            }

            return allNum;
        },

        /*将everyColsObj整合成分离对象，方便构建tr/td*/
        handleEveryColsObj:function(columns){
            var _self=this;

            /*得到总列数*/
            for(var k in _self.everyColsObj){
                _self.group[k]={};
            }

            _self.handleCols();

            /*将maxCol最小赋予1*/
            for(var m in _self.group){

                if(_self.group[m]["attr"].maxCol==0){
                    _self.group[m]["attr"].maxCol=1;
                }
            }

            /*增加label*/
            for(var k in _self.everyColsObj){
                _self.group[k]["attr"].label=_self.everyColsObj[k].label;
                _self.group[k]["attr"].className=_self.everyColsObj[k].className;
                _self.group[k]["attr"].key=_self.everyColsObj[k].key;
            }

            _self.handleRows();
            // console.log(_self.group,_self.maxTrLength,7777);
            _self.handleGroupToTrGroup();
            // console.log(_self.rowIndexArgs,555);
            // console.log(_self.trArgs,222222);
        },

        /*将数组重组为需要的结构*/
        handleGroupToTrGroup:function(){
            var _self=this;

            for(var i in _self.group){
                // console.log(_self.group[i].attr);
                if(_self.rowIndexArgs.indexOf(_self.group[i].attr.rowIndex)<0){
                    _self.rowIndexArgs.push(_self.group[i].attr.rowIndex);
                }
            }

            // trArgs
            _self.rowIndexArgs.forEach(function(v,k){
                _self.trArgs[v]=[];
                for (var m in  _self.group){
                    if(_self.group[m].attr.rowIndex==v){
                        _self.trArgs[v].push(_self.group[m].attr);
                    }
                }
            })

        },


        /*添加attr属性，并获取每个的最大列数*/
        handleCols:function(){
            var _self=this;
            for(var k in _self.everyColsObj){
                for(var i in _self.group){
                    if(_self.everyColsObj[k].parent!=undefined&&_self.everyColsObj[k].parent.split(",").indexOf(i)>-1){
                        _self.group[i][k]=_self.everyColsObj[k];
                    }
                }
            }
            for(var i in _self.group){
                _self.group[i].attr={maxCol:0};
                for(var m in _self.group[i]){
                    if(m!='attr'){
                        _self.group[i].attr.maxCol=_self.group[i][m].length==0?++_self.group[i].attr.maxCol:_self.group[i].attr.maxCol;
                    }
                }
            }
        },

        /*获取第几行和跨行几行*/
        handleRows:function(){
            var _self=this;


            for(var k in _self.everyColsObj){
                /*获取最大行数*/
                if(_self.everyColsObj[k].parent==undefined){
                    _self.maxTrLength=1;
                }else{
                    if(_self.everyColsObj[k].parent.indexOf(",")<0){
                        _self.maxTrLength=2;
                    }else{
                        if(_self.maxTrLength<=_self.everyColsObj[k].parent.split(",").length){
                            _self.maxTrLength=_self.everyColsObj[k].parent.split(",").length+1;
                        }
                    }
                }

                /*获取处于第几个tr*/
                if( _self.everyColsObj[k].parent==undefined){
                    _self.group[k].attr.rowIndex=1;
                }else if(_self.everyColsObj[k].parent.indexOf(",")<0){
                    _self.group[k].attr.rowIndex=2;
                }else{
                    _self.group[k].attr.rowIndex=_self.everyColsObj[k].parent.split(",").length+1;
                }

            }

            /*获取跨行*/
            console.log(_self.everyColsObj);
            for(var k in _self.everyColsObj){
                if(_self.everyColsObj[k].length==0){
                    _self.group[k].attr.maxRow=_self.maxTrLength-_self.group[k].attr.rowIndex+1;
                }else{
                    _self.group[k].attr.maxRow=1;
                }

            }

        }


    };


    var datagrid=function (ele,option){
        this.ele=ele;

        this.default={totalCols:0,totalColsArgs:{},newColumns:""};

        var newOpt=dtValidate.filter.call(this,option);

        this.opt=$.extend({},newOpt,this.default);

        var _self=this;

        dtValidate.allColsObj(_self.opt.columns,_self.opt.totalColsArgs,_self.opt.totalCols);

        dtValidate.handleEveryColsObj(_self.opt.columns);

        this.opt.newColumns=dtValidate.trArgs;
        console.log(this.opt.newColumns,8989);
        this.init();
        // this.init(ele,this.opt).createData(ele,this.opt).createPager(ele,this.opt);
    };

    var dg=datagrid.prototype;

    // 表头初始化
    dg.init=function(){
        var _self=this,
            trHtml="";
        for(var k in _self.opt.newColumns){
            var tr="<tr>";
            _self.opt.newColumns[k].forEach(function(v,m){
                tr+="<td colspan='"+ v.maxCol+"' rowspan='"+v.maxRow+"'>"+v.label+"</td>";
            });
            tr+="</tr>";
            trHtml+=tr;
        }

        var tableHtml='<table>'+
            '<thead>'+
            trHtml+
            '</thead>'+
            '</table>';
        this.ele.html(tableHtml);

        // if(opt.keys==undefined||opt.keys.length==0)return;

        // var footerThArgs=opt.keys.map(function(item,index){
        //   return "<th>"+item+"</th>";
        // });
        //
        // var tableHtml='<table cellspacing="0" width="100%">'+
        //                   '<thead>'+
        //                   '<tr>'+
        //                     footerThArgs.join("")+
        //                   '</tr>'+
        //                   '</thead>'+
        //                   '</table>'+
        //                   '<div id="'+opt.pager+'">'+
        //                   '</div>';
        // ele.html(tableHtml);

        return this;
    };

    //完全使用dataTable插件
    // dg.createData=function(ele,opt){
    //     opt.dg=ele.find("table").DataTable(opt.dataTable);
    //     return this;
    // };

    // //创建页码
    /*页面参数iPager定死*/
    // dg.createPager=function(ele,opt){
    //     var ajaxOptions = this.options.ajax;
    //
    //     ajaxOptions.success = function(){
    //
    //     };
    //
    //     if(ajaxOptions.success){
    //         var old = ajaxOptions.success;
    //         ajaxOptions.success = function(){
    //             var res = old();
    //             xxx;
    //         };
    //     }
    //
    //     dataField
    //
    //     setTimeout(function(){
    //         $("#"+opt.pager).pager({
    //             total: opt.dg ? opt.dg.column( 3 ).data().length/10:1,
    //             current: opt.current,
    //             showFirstBtn: false
    //         }).on("pager:switch", function(event, index){
    //             opt.dataTable.ajax.data.iPager=index;
    //             opt.current=index;
    //             dg.destory(ele);
    //             dg.init(ele,opt).createData(ele,opt).createPager(ele,opt);
    //         });
    //     },100);
    //     return this;
    // };

    // /*暴露方法处理total处理*/
    // dg.setTotal=function(total){
    //     this.opt.total=total;
    //     console.log(this.opt.total,777);
    // };

    //销毁datatable
    // dg.destory=function(ele){
    //     // ele.find("table").length>0 &&
    //     ele.html("");
    // };

    /**/

    //新增jquery扩展函数dataTables
    $.fn.datagrid = function (option) {
        return new datagrid(this,option);
    };

});
