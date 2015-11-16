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
		integer: 'integer',
		numeric: 'numeric',
		date: 'date',
		bool: 'boolean',
		//数据库查询类型
		rowset: 'rowset',
		row: 'row',
		scalar: 'scalar',
		nonQuery: 'non-query',
		insert: 'insert',
		update:'update',
		any: 'any'
	};



}());