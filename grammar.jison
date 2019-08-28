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
    : t_STRING { $$ = {string: $1}}
    | t_NUMBER { $$ = {number: $1}}
    ;

op 
    : t_OP_EQ { $$ = 'IS' }
    | t_OP_NOTEQ { $$ = 'ISNOT' }
    | t_OP_GT { $$ = { op: $1 } }
    | t_OP_LT { $$ = { op: $1 } }
    | t_OP_GTEQ { $$ = { op: $1 } }
    | t_OP_LTEQ { $$ = { op: $1 } }
    ;

expr
    : t_PARAM op value { $$ = {op: $2, param: $1, right: $3}; }
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
    | t_PARAM t_OP_IS t_KW_CONNECTED 
        { $$ = {op: 'IS', param: $1, right: $3}; }
    | t_PARAM t_OP_ISNOT t_KW_CONNECTED 
        { $$ = {op: 'ISNOT', param: $1, right: $3}; }
    | t_PARAM t_OP_IS t_KW_SET 
        { $$ = {op: 'IS', param: $1, right: $3}; }
    | t_PARAM t_OP_ISNOT t_KW_SET 
        { $$ = {op: 'ISNOT', param: $1, right: $3}; }
    | t_LPAR expr t_RPAR 
        { $$ = {op: 'PAR', expr: $2}; }
    | expr t_OP_AND expr 
        { $$ = {op: 'AND', left: $1, right: $3}; }
    | expr t_OP_OR expr 
        { $$ = {op: 'OR', left: $1, right: $3}; }
    ;

action 
    : t_KW_COPY t_PARAM { $$ = {action: $1, param: $2 } }
    | t_KW_CONNECT  { $$ = {action: $1 } }
    | t_KW_IGNORE { $$ = {action: $1 } }
    | t_KW_SET t_STRING { $$ = {action: $1, value: $2 } }
    | t_KW_SET t_NUMBER { $$ = {action: $1, value: $2 } }
    ;

statement 
    : action t_KW_IF expr t_KW_ELSE action -> {statement: [$1, $2, $3, $4, $5]}
    | action t_KW_IF expr -> {statement: [$action, $t_KW_IF, $expr]}
    | t_KW_IF expr t_KW_ELSE action
    | action 
        { $$ = {statement: $1 } }
    | expr 
        -> {statement: $1}
    ;

expressions
    : statement EOF {return $1;}
    ;
