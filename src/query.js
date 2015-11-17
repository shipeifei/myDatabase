     var myQuery = myQuery || {};

     (function() {

         var self = myQuery;

         self.operationsMap = {
             '=': '=',
             '!': '!=',
             '>': '>',
             '<': '<',
             '>=': '>=',
             '<=': '<=',
             '!=': '<>',
             '<>': '<>'
         };



         self.Query = function(sql, params, table, pk) {
             var that = this;
             that.sql = sql;
             that.params = params || {};
             that.table = table;
             that.pk = pk;

             /**
              * 转换类型为sqlite识别的类型
              * @param  {[type]} p [description]
              * @return {[type]}   [description]
              */
             that.typeToDb = function(p) {
                 if (utils.isDate(p)) {
                     return p.toISOString();
                 }
                 if (utils.isBoolean(p)) {
                     return p ? 1 : 0;
                 }
                 return p;
             };



             /**
              * 追加sql语句
              * @param  {[type]} sql sql语句:select * from table
              * @return {[type]}     [description]
              */
             that.append = function(sql) {
                 that.sql += (arguments.length === 1 ? sql : utils.format.apply(null, utils.toArray(arguments)));
                 return that;
             }

             /**
              * 排序
              * @param  {[type]} sort 排序字段
              * @param  {[type]} desc 排序顺序默认为：正
              * @return {[type]}      [description]
              */
             that.order = function(sort, desc) {
                 return that.append(" ORDER BY {0}{1}", sort, (desc ? " desc " : ""));
             }

             /**
              * 分页
              * @param  {[type]} count  开始页
              * @param  {[type]} offset 分页数量
              * @return {[type]}        [description]
              */
             that.limit = function(count, offset) {
                 return utils.isUndef(offset) ? that.append(" LIMIT {0}", count) : that.append(" LIMIT {0} OFFSET {1}", count, offset);
             };

             that.page = function(startPage, pageSize) {
                 return utils.isUndef(pageSize) ? that.append(" LIMIT {0}", startPage) : that.append(" LIMIT {0} OFFSET {1}", startPage, pageSize);
             }


             /**
              * 获取第一条记录
              * @return {[type]} [description]
              */
             that.first = function() {
                 return that.append(" LIMIT(1) ");
             };

             /**
              * 获取最后一条记录
              *
              * @return {[type]}      [description]
              */
             that.last = function() {
                 return that.append(" ORDER BY {0} DESC LIMIT(1) ", that.pk);
             }


             //select * from table where name = ? and password = ?
             //var o=new myQuery.Query("select * from table",[],"table",'id');

             //console.log(o.where({' name =':"shipeifei",' password = ':123456}));
             that.where = function(conditions) {
                 if (utils.isUndef(conditions)) {
                     return that;
                 }

                 if (utils.isNumber(conditions)) {
                     return self.append(' WHERE "{0}" = {1}', that.pk, conditions);
                 }

                 if (utils.isString(conditions)) {
                     that.params.push(conditions);
                     return self.append(' WHERE "{0}" = {1}', that.pk, utils.placeholder(that.params.length));
                 }

                 var _conditions = [];
                 for (var key in conditions) {
                     var value = conditions[key];

                     var parts = key.trim().split(/ +/);
                     var property = parts[0];
                     var operation = self.operationsMap[parts[1]] || '=';

                     if (!Array.isArray(value)) {
                         that.params.push(value);
                         _conditions.push(utils.format('"{0}" {1} {2}', property, operation, utils.placeholder(that.params.length)));
                     } else {
                         var arrayConditions = [];
                         value.forEach(function(v) {
                             that.params.push(v);
                             arrayConditions.push(utils.placeholder(that.params.length));
                         });
                         _conditions.push(utils.format('"{0}" {1} ({2})', property, operation === '!=' || operation === '<>' ? 'NOT IN' : 'IN', arrayConditions.join(', ')));
                     }
                 }
                 return that.append(' WHERE ' + _conditions.join(' AND '));
             };



         };



     }());