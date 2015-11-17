

var tables=tables||{};

/**
 * 针对sqlite数据库表的操作，包括：创建、删除、修改、条件查询,创建数据表、删除数据表
 *
 * @return {[type]} [description]
 */
(function () {

    var self=tables;

    self.table=function (tableName,db) {


         var that=this;
         that.db=db;
         that.tableName=tableName;
         this.dropTable = function (tableName) {
			return new websql.Query("DROP TABLE IF EXISTS " + tableName, [], new websql.Table(tableName, "", self), self.cs.any);
		};

		var _createColumn = function (columnName, columnProps) {
			if(utils.isString(columnProps)) {
				return columnName + " " + _translateType(columnProps);
			}
			return columnName + " " + _translateType(columnProps.type) +
					( columnProps.required ? " NOT NULL" : "" ) +
					( columnProps.unique ? " UNIQUE" : "");
		};

		this.createTable = function (tableName, columns, checkExists) {

			var _sql = "CREATE TABLE " + ( checkExists ? "IF NOT EXISTS " : "" ) + tableName + "(";
			var _cols = [];

			_cols.push( _createColumn( 'id', "pk" ) );
			for (var c in columns) {
				if (c === "timestamps") {
					_cols.push("created_at int");
					_cols.push("updated_at int");
				} else if (c !== 'id') {
					_cols.push( _createColumn( c, columns[c] ) );
				}
			}


			_sql += _cols.join(", ") + ")";
			return new websql.Query(_sql, [], new websql.Table(tableName, "id", self), self.cs.any);
		};

		this.createColumn = function(tableName, columnName, columnProps) {
			return new websql.Query("ALTER TABLE " + tableName + " ADD COLUMN " + _createColumn( columnName, columnProps ), [], new websql.Table(tableName, "", self), self.cs.any);
		};

    }


}());