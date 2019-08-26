
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */

/* # Regular expression rules for simple tokens */

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
/* t_STRING = r'"\w+"' */



/* # regex rule with action code */

[0-9]+("."[0-9]+)?\b  return 't_NUMBER'
"is"                  return 't_OP_IS'
"or"                  return 't_OP_OR'
"and"                 return 't_OP_AND'
"if"                  return 't_KW_IF'
"set"                 return 't_KW_SET'

\w+                   return 't_PARAM'

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

expressions
    : song
        { return { song: $1 }; }
    ;

song
    : t_KW_IF PARAM t_OP_IS
        { $$ = $PARAM; }
    ;

PARAM
    : t_PARAM
        { $$ = yytext; }
    ;
