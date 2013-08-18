﻿/*jshint globalstrict: true*/
/*jshint shadow: true*/
/*jshint loopfunc: true*/
'use strict';

var locale_i18n = [
  'extName', 'option', 'normal', 'keyBind', 'import', 'export',
  'setReleaseFileUrlTitle', 'setTimerTitle',
  'otherTitle', 'assignment', 'in_extension', 'author', 'no_release',
  'explanation',
  'explanation_problem1', 'explanation_solution', 'explanation_problem2',
  'explanation_problem3', 'explanation_problem4', 'forcibly_close_restore',
  'sample', 'example', 'assignment_title', 'assignment_favicon', 'default',
  'save', 'load', 'init', 'minute', 'exclude_url',
  'release', 'switch_not_release', 'all_unpurge', 'restore',
  'regex_tool',
  'regex_refURL', 'regex', 'regex_compare_string', 'regex_reference',
  'regex_option_reference', 'regix_result', 'regex_information',
  'regex_confuse'
];

function loadValues(document, values, debugCallback)
{
  if (document === void 0 ||
      toType(values) !== 'object' && values !== null || values === void 0) {
    throw new Error('Arguments type error.');
  }

  // Get All Option Value.
  chrome.storage.local.get(null, function(items) {
    var debugList = []; // use Debug

    items = values || items;
    var element = null;
    for (var key in items) {
      var value = items[key];
      var elName = key.match(
          /(^[\w]*)_(text|password|radio|checkbox|number|textarea)$/);
      if (elName) {
        switch (elName[2]) {
          case 'number':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = value;
            debugList.push(elName[1]);
            break;
          case 'radio':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"][@value="' + value + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = true;
            debugList.push(elName[1]);
            break;
          case 'checkbox':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).checked = value;
            debugList.push(elName[1]);
            break;
          case 'password':
          case 'text':
            element = document.evaluate(
                '//input[@name="' + elName[1] + '"]', document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
          case 'textarea':
            element = document.evaluate(
                '//textarea[@name="' + elName[1] + '"]',
                document, null, 7, null);
            if (element.snapshotLength !== 1) {
              console.log('loadValues() Get ' + elName[1] + ' error.');
              continue;
            }
            element.snapshotItem(0).value = trim(value);
            debugList.push(elName[1]);
            break;
        }
      }
    }

    if (toType(debugCallback) === 'function') {
      debugCallback(debugList);
    }
  });
}

function saveValues(document, saveTypes, callback)
{
  if (document === void 0 || toType(saveTypes) !== 'array') {
    throw new Error('Invalid argument.');
  }

  // inputタグの保存するtype
  var types = '';
  for (var i = 0; i < saveTypes.length; i++) {
    types += '@type="' + saveTypes[i] + '"';
    if (i + 1 < saveTypes.length) {
      types += ' or ';
    }
  }

  var storageName;
  var writeData = {};
  var inputs = document.evaluate(
      '//input[' + types + ']', document, null, 7, null);
  for (var i = 0; i < inputs.snapshotLength; i++) {
    storageName = inputs.snapshotItem(i).name +
                      '_' + inputs.snapshotItem(i).type;
    switch (inputs.snapshotItem(i).type) {
      case 'radio':
        if (inputs.snapshotItem(i).checked) {
          writeData[storageName] = inputs.snapshotItem(i).value;
        }
        break;
      case 'checkbox':
        writeData[storageName] = inputs.snapshotItem(i).checked;
        break;
      case 'text':
        writeData[storageName] = trim(inputs.snapshotItem(i).value);
        break;
      case 'number':
        writeData[storageName] = inputs.snapshotItem(i).value;
        break;
    }
  }

  var textareas = document.evaluate('//textarea', document, null, 7, null);
  for (var i = 0; i < textareas.snapshotLength; i++) {
    storageName = textareas.snapshotItem(i).name + '_' +
                      textareas.snapshotItem(i).tagName.toLowerCase();
    writeData[storageName] = trim(textareas.snapshotItem(i).value);
  }

  // writeData options.
  chrome.storage.local.set(writeData, function() {
    // writeDatad key catalog
    var debug = [];
    for (var key in writeData) {
      debug.push(key);
    }

    if (toType(callback) === 'function') {
      callback(debug);
    }
  });
}


/**
* 「解放に使うぺージを指定」の項目の有効無効状態を確認・変更
*/
function releasePageChangeState()
{
  var selectElement = document.evaluate(
      '//input[@name="release_page" and @value="assignment"]',
      document, null, 7, null);
  if (selectElement.snapshotLength !== 1) {
    throw new Error("onReleasePage function. can't get selectElement.");
  }

  var assi_options = document.evaluate(
      '//li[@id="assignment_options"]/input[@type="checkbox"]',
      document, null, 7, null);
  if (assi_options.snapshotLength !== 2) {
    throw new Error("onReleasePage function. can't get assi_options.");
  }
  var state = selectElement.snapshotItem(0).checked;
  var release_url = document.querySelector("input[name='release_url']");
  release_url.enabled = state;
  release_url.disabled = !state;
  for (var j = 0; j < assi_options.snapshotLength; j++) {
    assi_options.snapshotItem(j).disabled = state;
  }
}


/**
* ロケール文字列の読み込み
*/
function initTranslation(document, suffix)
{
  if (document === void 0 ||
      toType(suffix) !== 'string') {
    throw 'initTranslation Function is Argument Error.';
  }

  // テキストの設定
  for (var i = 0; i < locale_i18n.length; i++) {
    var el = document.getElementsByClassName(locale_i18n[i] + suffix);
    var message = chrome.i18n.getMessage(locale_i18n[i]);
    for (var j = 0; j < el.length; j++) {
      var string = el[j].innerHTML;
      var index = string.lastIndexOf('</');
      el[j].innerHTML = string.substring(0, index) +
                        message + string.substring(index);
    }
  }
}


/**
* 正規表現検証ツールの一致文字列を置き換える際に使用する関数
* @param {string} str マッチした部分文字列.
*/
function replacer(str) {
  return '<span style=\"background: red;\">' + str + '</span>';
}


/**
* 正規表現検証ツールの入力をチェック
*/
function checkRegex()
{
  var elRegularExpression =
      document.querySelector('input[name="regular_expression"]');
  var elOptions = document.querySelector('input[name="options"]');
  var elCompareString = document.querySelector('#compare_string');
  var elResult = document.querySelector('#result');

  // 正規表現で比較・置き換え
  var re = new RegExp(elRegularExpression.value,
                      elOptions.value ? elOptions.value : '');
  var replacedString = '';
  var compareStringSplit = elCompareString.value.split('\n');
  for (var i = 0; i < compareStringSplit.length; i++) {
    replacedString += compareStringSplit[i].replace(re, replacer) + '<br>';
  }

  // 結果を表示する領域の高さ変更
  elResult.style.height = compareStringSplit.length * 1.5 + 'em';

  // 表示
  elResult.innerHTML = replacedString;
}


/**
* 正規表現クイックリファレンスの生成と表示
*/
function createRegexReference()
{
  var regex_items = [
    { '[abc]' : 'regex_single' },
    { '.' : 'regex_any_single' },
    { '(...)' : 'regex_capture' },
    { '[^abc]' : 'regex_any_except' },
    { '\\s' : 'regex_whitespace' },
    { '(a|b)' : 'regex_or' },
    { '[a-z]' : 'regex_range' },
    { '\\S' : 'regex_non_whitespace' },
    { 'a?' : 'regex_zero_one' },
    { '[a-zA-Z]' : 'regex_range_or' },
    { '\\d' : 'regex_digit' },
    { 'a*' : 'regex_zero_more' },
    { '^' : 'regex_start' },
    { '\\D' : 'regex_non_digit' },
    { 'a+' : 'regex_one_more' },
    { '$' : 'regex_end' },
    { '\\w' : 'regex_word' },
    { 'a{3}' : 'regex_exactly' },
    { '\\W' : 'regex_non_word' },
    { 'a{3,}' : 'regex_three_or_more' },
    { '\\b' : 'regex_word_boundary' },
    { 'a{3,6}' : 'regex_between' }
  ];
  var regex_options = [
    { 'i' : 'regex_confuse' }
  ];

  // リファレンス作成
  var outputRegex = '<table>';
  var count = 0;
  for (var i in regex_items) {
    if (count === 0) {
      outputRegex += '<tr>';
    }

    for (var j in regex_items[i]) {
      outputRegex += '<th>' + j + '</th>';
      outputRegex += '<td>' +
          chrome.i18n.getMessage(regex_items[i][j]) + '</td>';
    }

    if (count >= 2) {
      outputRegex += '</tr>';
      count = 0;
      continue;
    }
    count++;
  }
  if (count !== 0) {
    outputRegex += '</tr>';
  }
  outputRegex += '</table>';

  // オプション部分作成
  var outputOption = '<table>';
  for (var i in regex_options) {
    if (count === 0) {
      outputOption += '<tr>';
    }

    for (var j in regex_options[i]) {
      outputOption += '<th>' + j + '</th>';
      outputOption += '<td>' +
          chrome.i18n.getMessage(regex_options[i][j]) + '</td>';
    }

    if (count >= 3) {
      outputOption += '</tr>';
      count = 0;
      continue;
    }
    count++;
  }
  if (count !== 0) {
    outputOption += '</tr>';
  }
  outputOption += '</table>';

  // 出力
  document.querySelector('#regex_reference').innerHTML = outputRegex;
  document.querySelector('#regex_option_reference').innerHTML = outputOption;
}

document.addEventListener('DOMContentLoaded', function() {
  initTranslation(document, 'Text');
  loadValues(document, default_values, function() {
    initKeybind(document, null, function() {
      loadValues(document, null, function() {
        releasePageChangeState();
      });
    });
  });

  var timeoutTime = 1000;

  // 設定項目など
  var elements = document.querySelectorAll("input[name='release_page']");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', releasePageChangeState);
  }

  // section buttons.
  var normal = document.getElementById('normal');
  var keybind = document.getElementById('keybind');
  normal.addEventListener('click', function() {
      document.getElementById('normal_options').style.display = 'block';
      normal.disabled = true;
      document.getElementById('keybind_options').style.display = 'none';
      keybind.disabled = false;
  });
  keybind.addEventListener('click', function() {
      document.getElementById('normal_options').style.display = 'none';
      normal.disabled = false;
      document.getElementById('keybind_options').style.display = 'block';
      keybind.disabled = true;
  });

  /* keybind */
  // Set Button
  var bindButtons = document.evaluate(
                '//button[@class="bindStart"]', document, null, 7, null);
  var bindStart = null;
  for (var i = 0; i < bindButtons.snapshotLength; i++) {
    bindButtons.snapshotItem(i).addEventListener('click', function() {
        bindStart = this.parentNode.parentNode.attributes.name.nodeValue;
    });
  }
  // Clear Button
  var bindClears = document.evaluate(
                '//button[@class="bindClear"]', document, null, 7, null);
  for (var i = 0; i < bindClears.snapshotLength; i++) {
    bindClears.snapshotItem(i).addEventListener('click', function() {
      var name = this.parentNode.parentNode.attributes.name.nodeValue;
      var optionName = name + '_keybind_text';
      if (default_values.hasOwnProperty(optionName)) {
        var keyInfo = JSON.parse(default_values[optionName]);
        var output = generateKeyString(keyInfo);
        showKey(document, name, output);
        copyKeyInfoToSaveArea(name, keyInfo);
      }
    });
  }
  function initKeybind(document, values, callback)
  {
    if (document === void 0 ||
        toType(values) !== 'object' && values !== null) {
      throw new Error(
        'initKeybind function is error. Invalid type of arguments.');
    }

    // show current key.
    chrome.storage.local.get(null, function(items) {
      var regex = /([\w_]+)_keybind_text/;
      var items = values || items;
      for (var key in items) {
        var matches = key.match(regex);
        if (matches) {
          var keyElement = document.getElementsByClassName(matches.input);
          if (keyElement !== void 0 && keyElement !== null) {
            var keyInfo = JSON.parse(items[key]);
            var output = generateKeyString(keyInfo);
            showKey(document, matches[1], output);
            copyKeyInfoToSaveArea(matches[1], keyInfo);

            if (toType(callback) === 'function') {
              callback();
            }
          }
        }
      }
    });
  }
  function keyCheck(e)
  {
    if (e === void 0) {
      throw new Error("Invalid argument. don't get event object.");
    }

    return {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      keyCode: e.keyCode
    };
  }
  function generateKeyString(keyInfo)
  {
    if (toType(keyInfo) !== 'object') {
      throw new Error('Invalid type of argument.');
    }

    var output = '';
    if (keyInfo.meta) { output += 'Meta +'; }
    if (keyInfo.ctrl) { output += 'Ctrl +'; }
    if (keyInfo.alt) { output += 'Alt +'; }
    if (keyInfo.shift) { output += 'Shift +'; }
    var charKey = String.fromCharCode(keyInfo.keyCode);
    output += charKey;
    return output;
  }
  function showKey(document, bindStart, output)
  {
    if (document === void 0 ||
        toType(bindStart) !== 'string' || toType(output) !== 'string') {
      throw new Error('showKey function is error. invalid type of arguments.');
    }

    var elementCode =
        '//section[@id="keybind_options"]//tr[@name="' + bindStart + '"]';

    var outElement = document.evaluate(
        elementCode + '//*[@class="pressKey"]', document, null, 7, null);
    if (outElement.snapshotLength !== 1) {
      throw new Error('snapshotLength is not 1 in showKey.');
    }
    outElement.snapshotItem(0).textContent = output;
  }
  function copyKeyInfoToSaveArea(bindStart, keyInfo)
  {
    var elementCode =
        '//section[@id="keybind_options"]//tr[@name="' + bindStart + '"]';

    var keydata = document.evaluate(
        elementCode + '//input[@class="keydata"]', document, null, 7, null);
    if (keydata.snapshotLength !== 1) {
        throw new Error('snapshotLength is not 1 in copyKeyInfoToSaveArea.');
    }
    keydata.snapshotItem(0).value = JSON.stringify(keyInfo);
  }

  document.addEventListener('keyup', function(event) {
    try {
      if (bindStart !== null) {
        var keyInfo = keyCheck(event);
        if (32 < keyInfo.keyCode && keyInfo.keyCode < 123) {
          var output = generateKeyString(keyInfo);
          showKey(document, bindStart, output);
          copyKeyInfoToSaveArea(bindStart, keyInfo);
        } else {
          throw new Error("It don't correspond.");
        }
      }
    } catch (e) {
      if (e.message !== "It don't correspond.") {
        console.log(e.message);
        return;
      }

      var elementCode =
          '//section[@id="keybind_options"]//tr[@name="' + bindStart + '"]';

      var bind_status = document.evaluate(
          elementCode + '//*[@class="status"]', document, null, 7, null);
      if (bind_status.snapshotLength !== 1) {
          throw new Error('snapshotLength is not 1.');
      }
      var item = bind_status.snapshotItem(0);
      item.innerText = e.message;
      setTimeout(function() {
        item.innerText = '';
      }, timeoutTime);
    } finally {
      bindStart = null;
    }
  });

  /* status */
  var status = document.getElementById('status');
  document.getElementById('save').addEventListener('click', function() {
    saveValues(document, ['checkbox', 'radio', 'text', 'number'], function() {
      chrome.runtime.sendMessage({ event: 'initialize' });

      status.innerHTML = 'Options Saved.';
      setTimeout(function() {
        status.innerHTML = '';
      }, timeoutTime);
    });
  }, false);
  document.getElementById('load').addEventListener('click', function() {
    loadValues(document, null, function() {
      status.innerHTML = 'Options Loaded.';
      setTimeout(function() {
        status.innerHTML = '';
      }, timeoutTime);
    });
  }, false);
  document.getElementById('init').addEventListener('click', function() {
    loadValues(document, default_values, function() {
      initKeybind(document, default_values, function() {
        status.innerHTML = 'Options Initialized.';
        setTimeout(function() {
          status.innerHTML = '';
        }, timeoutTime);
      });
    });
  }, false);

  // Import and Export
  var config_view = document.getElementById('config_view');
  var config_view_status = document.getElementById('config_view_status');
  document.getElementById('export').addEventListener('click', function() {
    chrome.storage.local.get(null, function(items) {
      config_view.value = JSON.stringify(items);
    });
  }, false);
  document.getElementById('import').addEventListener('click', function() {
    try {
      var items = JSON.parse(config_view.value);
      loadValues(document, items, function() {
        config_view_status.textContent = 'Success. Please, save';
        config_view_status.style.color = 'green';
        setTimeout(function() {
          config_view_status.innerHTML = '';
        }, 1000);
      });
    } catch (error) {
      config_view_status.textContent = 'Import error. invalid string.';
      config_view_status.style.color = 'red';
      return;
    }
  }, false);

  /* 正規表現確認ツール関係 */
  // 正規表現確認ツールの表示・非表示アニメーション
  var move_pixelY = 460; // 表示サイズ
  var elTool = document.querySelector('#tool_box');
  elTool.style.webkitTransitionProperty = '-webkit-transform';
  elTool.style.webkitTransitionDelay = '0.0s';
  elTool.style.webkitTransitionDuration = '1.0s';
  elTool.style.webkitTransitionTimingFunction = 'ease';
  elTool.style.height = move_pixelY + 'px';

  // toggle
  var clicked = false;
  var elOpenTool = document.querySelectorAll('.open_tool');
  for (var i = 0; i < elOpenTool.length; i++) {
    elOpenTool[i].addEventListener('click', function() {
      if (clicked) {
        elTool.style.webkitTransform = 'translate(0px, ' + move_pixelY + 'px)';
        clicked = false;
      } else {
        elTool.style.webkitTransform = 'translate(0px, ' + -move_pixelY + 'px)';
        clicked = true;
      }
    });
  }

  document.querySelector('input[name="regular_expression"]').addEventListener(
      'keyup', checkRegex);
  document.querySelector('input[name="options"]').addEventListener(
      'keyup', checkRegex);
  document.querySelector('#compare_string').addEventListener(
      'keyup', checkRegex);

  // 正規表現クイックリファレンス
  createRegexReference();
});