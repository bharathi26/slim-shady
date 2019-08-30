/*
 * RenderMan Vstruct Conditional Expressions Jison parser grammar rules
 * loosely based on: https://github.com/agershun/WebSQLShim/blob/master/src/sqliteparser.js
 * Thanks to: http://nolanlawson.github.io/jison-debugger/
 *
 * Example Expressions:
 
 connect if underMaterial_singlescatterK > 0 
         or (enableSinglescatter == 1 and (singlescatterK > 0 
         or singlescatterK is connected or singlescatterDirectGain > 0 
         or singlescatterDirectGain is connected))

 connect if ((rrReflectionK is connected or rrReflectionK > 0) 
         and enableRR == 1) or 
         underMaterial_walterReflectionK is connected 
         else set 0

 connect if enableClearcoat == 1 
 
 set 1.0 if enableRR == 1 else set 0.0
 
 */


/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */

/*# regex for simple tokens
 #
 # Regular expression rules for simple tokens*/

"("                   return 't_LPAR'
")"                   return 't_RPAR'
"=="                  return 't_OP_EQ'
"!="                  return 't_OP_NOTEQ'
">="                  return 't_OP_GTEQ'
"<="                  return 't_OP_LTEQ'
">"                   return 't_OP_GT'
"<"                   return 't_OP_LT'
"is not"              return 't_OP_ISNOT'
"else"                return 't_KW_ELSE'
"connected"           return 't_KW_CONNECTED'
"connect"             return 't_KW_CONNECT'
"ignore"              return 't_KW_IGNORE'
"copy"                return 't_KW_COPY'


/* # regex rule with action code */

[0-9]+("."[0-9]+)?\b  return 't_NUMBER'
"is"                  return 't_OP_IS'
"or"                  return 't_OP_OR'
"and"                 return 't_OP_AND'
"if"                  return 't_KW_IF'
"set"                 return 't_KW_SET'

\w+                   return 't_PARAM'
"\w+"                 return 't_STRING'


<<EOF>>               return 'EOF'
.                     return 'INVALID'


/lex

/* operator associations and precedence */

%left 't_OP_OR'
%left 't_OP_AND'
%left 't_LPAR'
%right 't_OP_NOTEQ'


%start expressions /* starting rule / point of the grammar */

%% /* language grammar */

expressions
    : statement EOF {return $1;}
    ;

para
    : t_PARAM
        %{
          $$ = p_param($1);
        %}
    ;

value
    : t_STRING { $$ = $1}
    | t_NUMBER { $$ = $1}
    ;

op
    : t_OP_EQ { $$ = 'EQ'}
    | t_OP_NOTEQ { $$ = 'NOTEQ'}
    | t_OP_GT { $$ = 'GT'}
    | t_OP_LT { $$ = 'LT'}
    | t_OP_GTEQ { $$ = 'GTEQ'}
    | t_OP_LTEQ { $$ = 'LTEQ'}
    ;

expr
    : para op value 
        %{
          $$ = p_expr_param_op_value($1, $2, $3);
        %}
    | t_OP_AND op value
    | t_OP_OR op value
    | t_OP_IS op value
    | t_KW_IF op value
    | t_KW_ELSE op value
    | t_KW_CONNECTED op value
    | t_KW_CONNECT op value
    | t_KW_IGNORE op value
    | t_KW_COPY op value
    | t_KW_SET op value
    | para t_OP_IS t_KW_CONNECTED 
        %{
          $$ = p_expr_param_is_connected($1, $3);
        %}
    | para t_OP_ISNOT t_KW_CONNECTED 
        %{
          $$ = p_expr_param_isnot_connected($1, $3);
        %}
    | para t_OP_IS t_KW_SET 
        { $$ = {op: 'IS', param: $1, right: $3}}
    | para t_OP_ISNOT t_KW_SET 
        { $$ = {op: 'ISNOT', param: $1, right: $3}}
    | t_LPAR expr t_RPAR 
        { $$ = $2 }
    | expr t_OP_AND expr 
        %{
          $$ = p_expr_expr_and_expr($1, $3);
        %}
    | expr t_OP_OR expr 
        %{
          $$ = p_expr_expr_or_expr($1, $3);
        %}
    ;

action
    : t_KW_COPY para { $$ = {action: $1, param: $2}}
    | t_KW_CONNECT { $$ = {action: $1}}
    | t_KW_IGNORE { $$ = {action: $1}}
    | t_KW_SET value{ $$ = {action: $1, value: $2}}
    ;

statement
    : action t_KW_IF expr t_KW_ELSE action 
        %{
          $$ = p_statement_action_if_expr_else_action($1, $3, $5);
        %}
    | action t_KW_IF expr 
        %{
          $$ = p_statement_action_if_expr($1, $3);
        %}
    | t_KW_IF expr t_KW_ELSE action 
        { $$ = {statement: $1, op: 'IF_ELSE', left: $2, right: $4}}
    | action 
        %{
          $$ = p_statement_action($1);
        %}
    | expr 
        -> {statement: $1}
    ;


%%
// expr ------------------------------------------------------------------------

function p_param(param) {
  var dict = {};
  dict['enableClearcoat'] = "1";
  dict['enableRR'] = "0";
  dict['rrReflectionK'] = "connected";
  dict['singlescatterK'] = "not_connected";
  dict['singlescatterDirectGain'] = "0.92";
  var tot = dict[param];
  return tot;
}

function p_expr_param_op_value(param, op, value){
  var flag = new Boolean(false);
  switch(op) {
  case "EQ":
    flag = param == value;
    break;
  case "NOTEQ":
    flag = param != value;
    break;
  case "GT":
    flag = param > value;
    break;
  case "LT":
    flag = param < value;
    break;
  case "GTEQ":
    flag = param >= value;
    break;
  case "LTEQ":
    flag = param <= value;
    break;
  default:
    text = "I have never heard of that switch...";
  }
  return flag.toString();
}

function p_expr_param_is_connected(param, kw_connected){
  var flag = new Boolean(false);
  flag = param === kw_connected;
  return flag.toString();
}

function p_expr_param_isnot_connected(param, kw_connected){
  var flag = new Boolean(false);
  flag = param !== kw_connected;
  return flag.toString();
}

function p_expr_expr_and_expr(left, right){
  var l,r = 0
  var flag = new Boolean(false);
  if (left == "true"){
    l = 1
  }
  if (right == "true"){
    r = 1
  }
  l = Boolean(l)
  r = Boolean(r)
  flag = l && r;
  return flag.toString();
}

function p_expr_expr_or_expr(left, right){
  var l,r = 0
  var flag = new Boolean(false);
  if (left == "true"){
    l = 1
  }
  if (right == "true"){
    r = 1
  }
  l = Boolean(l)
  r = Boolean(r)
  flag = l || r;
  return flag.toString();
}

// statement -------------------------------------------------------------------

function p_statement_action_if_expr_else_action(action1, expr, action2){
  var action = action2
  if (expr === "true") {
    action = action1
  }
  return action;
}

function p_statement_action_if_expr(action1, expr){
  var action = { "action": "none" }
  if (expr === "true") {
    action = action1
  }
  return action
}

function p_statement_if_expr_else_action(){
}

function p_statement_action(action1){
  var action = action1
  return action
}
