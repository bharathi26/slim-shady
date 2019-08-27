/*
 * RenderMan Vstruct Conditional Expressions Jison parser grammar rules
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
">"                   return 't_OP_GT'
"<"                   return 't_OP_LT'
">="                  return 't_OP_GTEQ'
"<="                  return 't_OP_LTEQ'
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


%start expressions

%% /* language grammar */


value 
    : t_STRING { $$ = {type:'string', string: $1}}
    | t_NUMBER { $$ = {type:'number', number:$1}; }
    ;

op 
    : t_OP_EQ { $$ = { op: $1 } }
    | t_OP_NOTEQ { $$ = { op: $1 } }
    | t_OP_GT { $$ = { op: $1 } }
    | t_OP_LT { $$ = { op: $1 } }
    | t_OP_GTEQ { $$ = { op: $1 } }
    | t_OP_LTEQ { $$ = { op: $1 } }
    ;

expr
    : t_PARAM op value -> {expr: [$1, $2, $3]}
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
    | t_PARAM t_OP_IS t_KW_CONNECTED -> {expr: [$t_PARAM, $t_OP_IS, $t_KW_CONNECTED]}
    | t_PARAM t_OP_ISNOT t_KW_CONNECTED
    | t_PARAM t_OP_IS t_KW_SET
    | t_PARAM t_OP_ISNOT t_KW_SET
    | t_LPAR expr t_RPAR { $$ = {op: 'PAR', expr:$2}; }
    | expr t_OP_AND expr { $$ = {op: 'AND', left: $1, right: $3}; }
    | expr t_OP_OR expr { $$ = {op: 'OR', left: $1, right: $3}; }
    ;

action 
    : t_KW_COPY t_PARAM
    | t_KW_CONNECT
    | t_KW_IGNORE
    | t_KW_SET t_STRING
    | t_KW_SET t_NUMBER -> {action: [$t_KW_SET, $t_NUMBER]}
    ;

statement 
    : action t_KW_IF expr t_KW_ELSE action -> {statement: [$1, $2, $3, $4, $5]}
    | action t_KW_IF expr -> {statement: [$action, $t_KW_IF, $expr]}
    | t_KW_IF expr t_KW_ELSE action
    | action -> {statement: [$action]}
    | expr { $$ = { here: $1 } }
    ;

expressions
    : statement EOF {return $1;}
    ;
