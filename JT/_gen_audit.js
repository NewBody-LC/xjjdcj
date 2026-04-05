const fs = require('fs');
const EOL = String.fromCharCode(10);
const BT = String.fromCharCode(96); // backtick

function b(s) { return BT + s + BT; }
function cb(s) { return BT + BT + BT + EOL + s + EOL + BT + BT + BT; }

const L = [];
function w(s) { if (s !== undefined) L.push(s); }

w('# \u72B6\u6001\u68C0\u6D4B\u903B\u8F91\u5BA1\u8BA1\u6587\u6863');
w('');
w('> \u5BA1\u8BA1\u76EE\u6807: ' + b('f:/code/xjjdcj/index_with_webview.html'));
w('> \u5BA1\u8BA1\u65F6\u95F4: 2026-04-05');
w('> \u6587\u4EF6\u884C\u6570: 7221 \u884C');
w('');
w('---');
w('');

// Section 1
w('## \u4E00\u3001\u72B6\u6001\u5217\u8868\uFF08\u5168\u90E8\u53EF\u80FD\u72B6\u6001\uFF09');
w('');
w('\u7CFB\u7EDF\u4E2D\u5171\u6709 **10 \u4E2A\u72B6\u6001**\uFF1A');
w('');
w('| \u72B6\u6001\u540D | \u8BF4\u660E |');
w('|--------|------|');
const states = [
  ['\u5730\u56FE', '\u9057\u8FF9\u5730\u56FE\u754C\u9762\uFF0C\u53EF\u89C1\u8282\u70B9\u548C\u8DEF\u5F84'],
  ['\u6218\u6597', '\u6218\u6597\u8FDB\u884C\u4E2D\uFF0C\u5C4F\u5E55\u4E0A\u6709\u8840\u6761'],
  ['\u9009\u62E9', '\u88C5\u5907/\u82F1\u96C4\u9009\u62E9\u754C\u9762\uFF0C\u6709\u5361\u7247\u6392\u5217'],
  ['\u80DC\u5229\u5B8C\u6210', '\u6218\u6597\u80DC\u5229\u7ED3\u7B97\u754C\u9762'],
  ['\u5931\u8D25', '\u6218\u6597\u5931\u8D25\u754C\u9762'],
  ['\u51C6\u5907', '\u9057\u8FF9\u51C6\u5907\u754C\u9762\uFF08\u96BE\u5EA6\u9009\u62E9/\u5F00\u59CB\u6311\u6218\uFF09'],
  ['\u5165\u53E3\u754C\u9762', '\u6E38\u620F\u4E3B\u754C\u9762\uFF0C\u6709\u201C\u524D\u5F80\u9057\u8FF9\u201D\u6309\u94AE'],
  ['\u8282\u70B9\u6311\u6218', '\u70B9\u51FB\u8282\u70B9\u540E\u5F39\u51FA\u7684\u6311\u6218\u786E\u8BA4\u754C\u9762'],
  ['\u5546\u5E97', '\u5546\u5E97\u8D2D\u4E70\u754C\u9762'],
  ['\u4E8B\u4EF6', '\u968F\u673A\u4E8B\u4EF6\u9009\u62E9\u754C\u9762'],
  ['\u672A\u77E5', '\u65E0\u6CD5\u5224\u65AD\u7684\u72B6\u6001\uFF08\u5146\u5E95\uFF09'],
];
for (const [name, desc] of states) {
  w('| ' + b(name) + ' | ' + desc + ' |');
}
w('');
w('---');
w('');

// Section 2
w('## \u4E8C\u3001\u72B6\u6001\u68C0\u6D4B\u51FD\u6570\u4F53\u7CFB');
w('');
w('\u7CFB\u7EDF\u5B58\u5728 **\u4E24\u5957\u5E76\u884C\u7684\u72B6\u6001\u68C0\u6D4B\u7CFB\u7EDF**\uFF1A');
w('');
w('### 2.1 \u7B80\u5355\u50CF\u7D20\u68C0\u6D4B\u7CFB\uFF08\u65E7\u7248\uFF0C\u7528\u4E8E\u5146\u5E95\uFF09');
w('');
w(cb('detectGameState(bitmap, width, height)  [L2971]\n  +-- \u968F\u673A\u91C7\u6837500\u50CF\u7D20 -> \u8BA1\u7B97\u7EA2\u8272/\u9EC4\u8272\u6BD4\u4F8B\n  +-- \u626B\u63CF\u4E0B\u534A\u5C4F (y 65%-95%) -> \u8BA1\u7B97\u9EC4\u8272/\u7D2B\u8272\u6BD4\u4F8B\n  +-- detectFailureScreen(bitmap, width, height)  [L3153]\n  +-- detectSelectionState(bitmap, width, height)  [L3092]\n  +-- detectPopupOverlay(bitmap, width, height)  [L4010]'));
w('');
w('### 2.2 \u589E\u5F3A\u7248\u68C0\u6D4B\u7CFB\uFF08\u65B0\u7248\uFF0C\u5E26\u7F6E\u4FE1\u5EA6\uFF09');
w('');
w(cb('detectGameStateEnhanced()  [L3229]\n  +-- analyzeAllFeatures(bitmap, width, height)  [L3319]\n        +-- analyzeColorDistribution()  [L3345]  -- \u5168\u5C40\u989C\u8272\u5206\u5E03\n        +-- analyzeKeyRegions()  [L3403]  -- \u5173\u952E\u533A\u57DF\u5206\u6790\n        |     +-- analyzeRegion() x N  [L3423]  -- \u6BCF\u4E2A\u533A\u57DF\u91C7\u6837100\u50CF\u7D20\n        +-- detectSpecialPatterns()  [L3488]  -- \u7279\u6B8A\u6A21\u5F0F\u68C0\u6D4B\n              +-- detectHealthBarPattern()  [L3510]  -- \u8840\u6761\uFF08\u5DE6\u4E0A\u89D2\u7EA2\u8272\uFF09\n              +-- detectButtonPattern()  [L3545]  -- \u5E95\u90E8\u9EC4\u8272\u6309\u94AE\n              +-- detectChallengeButton()  [L3579]  -- \u4E2D\u592E\u504F\u4E0B\u9EC4\u8272\u6309\u94AE\n              +-- detectAbandonButton()  [L3613]  -- \u53F3\u4E0A\u89D2\u7EA2\u8272\u6309\u94AE\n              +-- detectCardPattern()  [L3646]  -- \u4E2D\u592E\u767D\u8272\u5361\u7247\n              +-- detectTitlePattern()  [L3683]  -- \u9876\u90E8\u6A59\u8272/\u7C89\u7EA2\u8272\u6807\u9898\n              +-- detectNodePattern()  [L3720]  -- \u5168\u5C4F\u8282\u70B9\u68C0\u6D4B\uFF08500\u91C7\u6837\uFF09'));
w('');
w('### 2.3 \u667A\u80FD\u68C0\u6D4B\uFF08\u5E26\u91CD\u8BD5\u548C\u72B6\u6001\u8F6C\u6362\u9A8C\u8BC1\uFF09');
w('');
w(cb('smartDetectState()  [L3984]\n  +-- detectStateWithRetry(maxRetries=3)  [L3893]\n        +-- detectGameStateEnhanced() x N  [L3229]\n        +-- analyzeMultipleResults(results)  [L3922]  -- \u591A\u6B21\u7ED3\u679C\u53D6\u6700\u4F18\n  +-- validateStateTransition(lastState, newState)  [L3961]'));
w('');
w('### 2.4 \u7EDF\u4E00\u5165\u53E3');
w('');
w(cb('detectCurrentRuinsState()  [L3066]\n  +-- smartDetectState()\n  +-- \u8FD4\u56DE result.state\uFF08\u4E22\u5F03\u7F6E\u4FE1\u5EA6\uFF09'));
w('');
w('---');
w('');

const content = L.join(EOL);
fs.writeFileSync('F:/code/xjjdcj/JT/_audit_template.txt', content, 'utf8');
console.log('Part 1-2 written:', content.length, 'bytes');