var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var isChrome = !!window.chrome && !isOpera;
var isIE = typeof document !== 'undefined' && !!document.documentMode && !isEdge;
var edgeVersion = isEdge ? navigator.userAgent.split('Edge/')[1].replace(".", "") : '';