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
        factory(window.jQuery, window.jQuery.klass);
    }
})(function ($,Class) {


    /*为datagrid提供方法*/
    var dtValidate={
        colsObj:{},  /*每列对象*/
        everyColsObj:[],    /*获取columns的每个对象属性*/
        group:[],         /*中间转换对象group*/
        group2:[],        /*中间转换对象group*/
        rowIndexArgs:{},  /*最终渲染的tr的对象*/
        maxTrLength:0,    /*最大行数*/
        /*过滤不必要的字段
         * @param fields 初始化配置字段对象（obj）
         * */
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
        /*获取列数对象，递归操作
         *
         * @param columns 参数cloumns对象
         * @param totalColsArgs 参数cloumns对象
         * @param totalCols 参数cloumns对象
         * @param final 参数cloumns对象
         * @param parentKey 当前列的父级
         * */
        allColsObj:function (columns,totalCols,parentKey){
            var _self=this;

            columns.forEach(function(v,k){
                /*获取分类跨列数*/
                var obj={
                    length:v.columns?v.columns.length:0,
                    parent:parentKey,
                    label:v.label,
                    className:v.className,
                    key:v.key,
                    maxCol:0,
                    rowIndex:1,
                    maxRow:0,
                    format:v.format
                };

                _self.everyColsObj.push(obj);

                if(v.columns!=undefined&&v.columns instanceof Array&&v.columns.length>0){
                    _self.allColsObj(v.columns,totalCols,parentKey==undefined?v.key:parentKey+','+v.key);
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
                // _self.group[k]=[];
                _self.group.push(_self.everyColsObj[k]);
            }

            _self.handleCols();


            /*将maxCol最小赋予1*/
            for(var m in _self.group2){
                for(var k in _self.group2[m]){
                    if(_self.group2[m][k].maxCol==0){
                        _self.group2[m][k].maxCol=1;
                    }
                }

            }

            _self.handleRows();
            _self.handleGroupToTrGroup();
        },

        /*将数组重组为需要的结构*/
        handleGroupToTrGroup:function(){
            var _self=this,typeRowIndexArgs=[];

            for(var k in _self.group2){
                for (var i in  _self.group2[k]){
                    if(typeRowIndexArgs.indexOf(_self.group2[k][i].rowIndex)<0){
                        typeRowIndexArgs.push(_self.group2[k][i].rowIndex);
                    }
                }
            }

            typeRowIndexArgs.sort();

            typeRowIndexArgs.forEach(function(v,k){
                _self.rowIndexArgs[v]=[];
                for(var k in _self.group2){
                    for (var i in  _self.group2[k]){
                        if( _self.group2[k][i].rowIndex==v){
                            _self.rowIndexArgs[v].push(_self.group2[k][i]);
                        }
                    }
                }
            });

        },


        /*添加attr属性，并获取每个的最大列数*/
        handleCols:function(){
            var _self=this;

            var parentArgs=[];
            for(var i =0;i<_self.everyColsObj.length;i++){
                if(_self.everyColsObj[i].parent==undefined){
                    parentArgs.push(_self.group[i].key);
                }
            }

            var o1={};

            for(var k in parentArgs) {
                o1[k] = {};
            }

            for(var k in parentArgs){
                for(var i in _self.group){

                    if(_self.group[i].parent==undefined&&_self.group[i].key==parentArgs[k]){
                        o1[k].attr=_self.group[i];
                        continue;
                    }

                    if(_self.group[i].parent!=undefined&&_self.group[i].parent.indexOf(parentArgs[k])>-1){
                        o1[k][i]=_self.group[i];

                    }

                }
            }

            /*一级分类计算maxCol*/
            for(var i in o1){
                for(var m in o1[i]){

                    if(m!="attr"&&o1[i][m].length==0){

                        o1[i].attr.maxCol++;

                    }

                }
            }

            /*非一级分类计算maxCol*/
            for(var i in o1){
                for(var m in o1[i]){
                    if(o1[i][m].parent!=undefined){

                        var key=o1[i][m].key;

                        for(var k in o1){
                            for(var j in o1[k]){
                                if(o1[k][j].parent!=undefined){
                                    var parentsArgs=o1[k][j].parent.split(",");
                                    if(parentsArgs.indexOf(key)>-1&&o1[k][j].length==0){
                                        o1[i][m].maxCol+=1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _self.group2=o1;

        },

        /*获取第几行和跨行几行*/
        handleRows:function(){
            var _self=this;

            for(var k in _self.everyColsObj){
                /*获取最大行数*/
                if(_self.everyColsObj[k].parent==undefined){
                    _self.maxTrLength=_self.maxTrLength>1?_self.maxTrLength:1;
                }else{
                    if(_self.everyColsObj[k].parent.indexOf(",")<0){
                        _self.maxTrLength=_self.maxTrLength>2?_self.maxTrLength:2;
                    }else{
                        if(_self.maxTrLength<=_self.everyColsObj[k].parent.split(",").length){
                            _self.maxTrLength=_self.everyColsObj[k].parent.split(",").length+1;
                        }
                    }
                }

            }

            /*获取处于第几个tr*/
            for(var m in _self.group2){
                for(var k in _self.group2[m]){

                    if( _self.group2[m][k].parent==undefined){
                        _self.group2[m][k].rowIndex=1;
                    }else if(_self.group2[m][k].parent.indexOf(",")<0){
                        _self.group2[m][k].rowIndex=2;
                    }else{
                        _self.group2[m][k].rowIndex=_self.group2[m][k].parent.split(",").length+1;
                    }
                }
            }

            /*获取跨行*/
            for(var k in _self.group2){
                for(var m in _self.group2[k]) {

                    if(_self.group2[k][m].length == 0){
                        _self.group2[k][m].maxRow = _self.maxTrLength - _self.group2[k][m].rowIndex+1 ;
                    }else{
                        _self.group2[k][m].maxRow = 1;
                    }

                }
            }

        },

        // /*深克隆对象*/
        cloneCurrentObj:function (obj1,obj2) {
            var _self=this,obj2=obj2||{};
            for(var i in obj1){
                obj2[i]=obj1[i];
            }
            return obj2;
        },

        /*使用完毕初始化*/
        dtValidateDestory:function(){
            this. colsObj={};
            this.everyColsObj=[];
            this.group=[];
            this.group2=[];
            this.rowIndexArgs={};
            this.maxTrLength=0;
        }

    };



    /*暴露方法*/
    var ds={
        dataGrid:"",
        ajaxSuccess:"",
        dom:"",
        ajaxJson:"",
        init:function(ele,option){
            this.dataGrid=new datagrid(ele,option);
            return this;
        },
        destroy:function(){
            this.dom.html("");
            return this;
        },
        on:function(){
            if(typeof arguments[0]=="string"){
                // var event=arguments[0].split(":");
                // console.log(event);
                // if(event.length!=2)return this;
                this.event[arguments[0]](arguments[1]);
            }else{
                return this;
            }
            return this;
        },
        event:{
            success:function (fn) {
                if(typeof fn != "function"){
                    return;
                }else{
                    setTimeout(function(){
                        fn(ds.ajaxJson);
                    },0);
                }
            },
            error:function(fn){
                /*修改dataTable报错方法，防止弹框报错*/
                $.fn.dataTable.ext.errMode = function(s,h,m){
                    if(typeof fn == "function"){
                        fn(s,h,m);
                    }
                }
            }
        }
    };


    /*datagrid构造函数*/

    var datagrid=function (ele,option){
        dg.initliaze(ele,option);
    };

    var dg=datagrid.prototype;

    /*
     * @param ele (jquery对象)（obj）
     * @param option  (初始化配置) （obj）
     * */
    dg.initliaze=function (ele,option){
        this.ele=ele;

        this.default={
            totalCols:0,
            totalColsArgs:{},
            newColumns:"",
            dataTable:"",
            aoData:[],
            beginOption:option,
            ds:''
        };

        this.newOpt=dtValidate.filter.call(this,option);

        this.opt=$.extend({},this.newOpt,this.default);

        var _self=this;

        dtValidate.allColsObj(_self.opt.columns,_self.opt.totalCols);

        dtValidate.handleEveryColsObj(_self.opt.column);

        // this.newOpt.everyColsObj=dtValidate.everyColsObj;

        /*深克隆*/
        // this.newOpt.everyColsObj = JSON.parse(JSON.stringify(dtValidate.everyColsObj));
        this.newOpt.everyColsObj = dtValidate.cloneCurrentObj(dtValidate.everyColsObj,this.newOpt.everyColsObj );

        // this.opt.newColumns=dtValidate.rowIndexArgs;

        /*深克隆*/
        // this.opt.newColumns = JSON.parse(JSON.stringify(dtValidate.rowIndexArgs));
        this.opt.newColumns = dtValidate.cloneCurrentObj(dtValidate.rowIndexArgs,this.opt.newColumns );

        dtValidate.dtValidateDestory();

        this.init(this.ele,this.dataTable,this.opt);

    };

    // 表头初始化
    /*
     * @param ele (jquery对象)（obj）
     * @param dt  (dataTables对象) （obj）
     * @param defo (过滤后的初始化配置) （obj）
     * */
    dg.init=function(ele,dt,defo){
        var _self=this,
            trHtml="";

        for(var k in defo.newColumns){
            var tr="<tr>";
            defo.newColumns[k].forEach(function(v,m){
                tr+="<td colspan='"+ v.maxCol+"' rowspan='"+v.maxRow+"' class='"+v.className+"'>"+v.label+"</td>";
            });
            tr+="</tr>";
            trHtml+=tr;
        }

        var tableHtml='<table cellspacing="0" width="100%" class="lg-table">'+
            '<thead>'+
            trHtml+
            '</thead>'+
            '</table>'+
            '<div id="pager"></div>';
        if(ele.find("table").length>0){
            ds.destroy();
        }
        ele.html(tableHtml);

        // return ;
        _self.createDataTable(ele,dt,defo);
        return _self;

    };

    /*ajax重写为source*/
    const CAN_FIELDS=['columns','pagerOptionsFormat','source',
        'fixedColumns','columnDefs','aoColumns','scrollY','scrollX','pagerOptionsFormat','dataTotal'];

    /*dataTable初始化*/
    dg.createDataTable=function(ele,dt,opt){

        var _self=this;

        /*防止与dataTable属性冲突*/
        if(opt.hasOwnProperty("columns")){
            delete opt.columns;
        }

        opt.dtDefaultOpt={
            // scrollX:true,
            paging:false,
            scrollCollapse: true,
            columns:[],
            ajax:{},
            searching: false,
            destroy:true,
            aoColumns:[]
        };

        var dtDefaultOpt=opt.dtDefaultOpt;
        // for(var k in opt.everyColsObj){
        //     if(opt.everyColsObj[k].length==0){
        //         var obj={
        //             "data":opt.everyColsObj[k].key
        //         };
        //         dtDefaultOpt.columns.push(obj);
        //     }
        // }

        for(var i in opt.beginOption.everyColsObj){
            var v=opt.beginOption.everyColsObj[i];
            if(v.length==0){
                if(v.format&&v.format instanceof Function){
                    var obj={
                        "data":v.format
                    }
                }else{
                    var obj={
                        "data":v.key
                    }
                }
                dtDefaultOpt.aoColumns.push(obj);
            }
        }

        /*将自定于方法赋予dataTable*/
        dtDefaultOpt.ajax.url=opt.source.ajaxUrl;
        dtDefaultOpt.ajax.data=opt.source.requestData;
        dtDefaultOpt.ajax.dataSrc=opt.source.dataSrc;
        // dtDefaultOpt.aoColumns=dtDefaultOpt.aoColumns;
        dtDefaultOpt.fixedColumns=opt.fixedColumns;
        dtDefaultOpt.scrollY=opt.scrollY;
        dtDefaultOpt.scrollX=opt.scrollX;

        // dtDefaultOpt.scrollCollapse=true;
        dtDefaultOpt.fnServerParams=function(aoData){
            for(var k in opt.source.requestData){
                var obj={name:k,value:opt.source.requestData[k]};
                aoData.push(obj);
            }
        };

        dtDefaultOpt.columns.forEach(function(v,k){

            delete v.mData;
        });

        dt=ele.find("table").DataTable(dtDefaultOpt);

        // if(ele.find("table").length>2){
        //     ele.find("table").eq(1).find("thead>tr").css({height:0})
        // }

        $(".dataTables_info").remove();

        var beginOption=opt.beginOption,
            source=opt.beginOption.source;

        dt.on( 'xhr', function () {
            ds.ajaxSuccess=true;
            var page=beginOption.pagerOptionsFormat();/*获取页数属性*/
            var json = ds.ajaxJson=dt.ajax.json();

            // if(beginOption.xhrEvent && beginOption.xhrEvent instanceof Function){
            //     beginOption.xhrEvent(json);
            // }

            var dataTotal=eval('json.'+source.dataTotal);
            _self.createPager(ele,dt,opt,page,dataTotal);

        } );

        return this;
    };

    /*创建页面*/
    dg.createPager=function(ele,dt,opt,page,dataTotal){
        var beginOption=opt.beginOption,
            source=opt.beginOption.source;

        $("#pager").pager({
            // total: page.total/page.perPage,
            total: dataTotal/page.perPage,
            current: source.requestData.iPage? source.requestData.iPage:1,
            showFirstBtn: false
        }).on("pager:switch", function(event, index){

            beginOption.pagerOptionsFormat=function () {
                return {
                    countPrePage: page.countPrePage,
                    total:  page.total,
                    perPage:  page.perPage
                }
            };

            opt.dtDefaultOpt.iPager=index;

            source.requestData.iPage=index;

            // dg.destory(ele);
            dg.destroy(dt);

            dg.initliaze(ele,beginOption);

        });
    };


    //销毁datatable
    dg.destroy=function(dt){
        ds.destroy();
    };

    //新增jquery扩展函数dataTables
    $.fn.datagrid = function (option) {
        var _self=this;
        ds.dom=_self;
        return ds.init(this,option);
        // if(Object.keys(ds).length==0){
        //
        //
        // }else{
        //     return new datagrid(this,option);
        // }
    };


});
