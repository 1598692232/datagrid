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

    return Class.$factory('datagrid', {

        initialize:function (option) {
            this.ele=$(option.dom);
            this.default={

            };


            this.opt = $.extend({}, this.default,option);
            this.createDataGrid();
        },

        createDataGrid:function (){
            var _self=this;
            console.log(_self.opt.columns)
            var ligerObj={
                columns:_self.opt.columns,
            };

            _self.ele.ligerGrid(ligerObj)
        }




    })

});
