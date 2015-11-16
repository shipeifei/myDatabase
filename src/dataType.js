/*
  作者:shipeifei
  版本1.0.0
  描述:数据类型封装
 */
var dataType = dataType || {};

(function() {


    var self = dataType;

    self.cs = {
        //数据库字段类型
        pk: 'pk',
        text: 'text',
        integer: 'int',
        numeric: 'numeric',
        decimal:'decimal',
        date: 'date',
        bool: 'boolean',

        //数据库查询类型
        rowset: 'rowset',
        row: 'row',
        scalar: 'scalar',
        nonQuery: 'non-query',
        insert: 'insert',
        update: 'update',
        any: 'any'
    };

    /**
     * 转换数据类型指定为sqlite特定的属性
     * @param  {[type]} typeName [description]
     * @return {[type]}          [description]
     */
    self.translateType = function(typeName) {
        var _result = typeName;

        switch (typeName) {
            case "pk":
                _result = "INTEGER PRIMARY KEY  AUTOINCREMENT";
                break;
            case "int":
                _result = "INTEGER";
                break;
            case "decimal":
                _result = "numeric";
                break;
            case "date":
                _result = "datetime";
                break;
            case "text":
                _result = "text";
                break;
            case "boolean":
                _result = "boolean";
                break;
        }
        return _result;
    };



}());