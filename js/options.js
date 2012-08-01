/** options.html�œǂݍ��ݎ��Ɏ��s����X�N���v�g */

var locale_i18n = [
    'extName', 'option', 'setTimerTitle', 'refURL',
    'default', 'save', 'clear', 'minute','exclude_url',
];

var storage = {
    'timer' : localStorage['timer'],
    'exclude_url' : localStorage['exclude_url'], 
};
    
/**
 * �I�v�V������ۑ�
 *
 * @param {Object} options
 * @param {String} options.name �ۑ�����v�f��
 * @param {Number} [options.index = 0] �ۑ�����v�f���Ƃ̈ʒu
 * @param {Any} options.value �ۑ�����l
 *
 * @return �Ȃ�
 */
function SetElementName(options)
{
    var index = options.index ? options.index : 0;
    var value = options.value;
    var name = options.name;

    var element = document.getElementsByName(options.name)[index];
    element.value      = value;
    storage[name] = value;
    localStorage[name] = value;
}

/**
 * SetElementName��Checkbox, Radio�{�^���p
 * ������SetElementName�Ɠ���
 *
 * @returns �Ȃ�
 */
function SetElementNameCheck(options)
{
    SetElementName(options);
    element.checked = true;
}

/**
 * �w�肵���v�f�̃I�v�V�������擾�E�ۑ�����
 *
 * @param {Object} options
 * @param {String} options.name �ۑ�����v�f��
 * @param {String} options.type �ۑ�����v�f�̃^�C�v
 *                              number: ���l
 *                              text: �e�L�X�g�{�b�N�X
 *                              textarea: �e�L�X�g�G���A
 *                              radio: ���W�I�{�^��
 * @param {Number} [options.index = 0] �ۑ�����v�f�����Ƃ̔ԍ�
 *                                     ���W�I�{�^���ȂǂŎg�p�B
 * @param {Function} [options.compare] ����������A��r�֐��B
 *                                     �߂�l��true�Ȃ�options.value,
 *                                     false�Ȃ�options.compare_value��ۑ�
 * @param {Any} [options.compare_value] compare��false���������̒l�B
 *
 * @throws {Error} options.type�̒l���Ή����Ă��Ȃ���������
 * @returns �Ȃ�
 */
function SaveElementName(options)
{
    if (!options.index) {
        options.index = 0;
    }

    var element = document.getElementsByName(options.name)[options.index];
    var value = element.value;

    if (options.compare && options.compare_value) {
        value = options.compare(value) ? value : options.compare_value;
    }

    // value���^�C�v���ƂɏC��
    switch (options.type) {
        case 'number':
            break;
        case 'textarea':
            value = value.trim();
            break;
        default:
            throw new Error('SetElementName Error.', options);
            break;
    }

    // �ۑ�
    element.value              = value;
    storage[name]              = value;
    localStorage[options.name] = value;
}

// 
/**
 * �w�肵�����O�̗v�f��ǂݍ���
 * ���W�I�{�^���̂悤�ȓ���̖��O�𕡐������Ă���v�f�ɂ͖��Ή��B
 *
 * @param {String} name �ǂݍ��ޗv�f�̖��O
 * @param [Any] default_value �v�f���ۑ�����Ă��Ȃ������ꍇ�̃f�t�H���g�l
 *
 * @returns �Ȃ�
 */
function LoadElementName(name, default_value)
{
    var element = document.getElementsByName(name)[0];
    var option = storage[name] ? storage[name] : default_value;

    element.value      = option;
    storage[name]      = option;
    localStorage[name] = option;
}

function InitDefault()
{
    SetElementName({ name: 'timer', value: default_timer});
    SetElementName({ name: 'exclude_url', value: default_exclude_url});
    
    chrome.extension.sendRequest({ event : 'init'});
}

function Save()
{
    SaveElementName({ name: 'timer', type: 'number',
            compare: function(value) {
                return value >= 1;
            }, compare_value: 1});
    SaveElementName({ name: 'exclude_url', type: 'textarea'});

    chrome.extension.sendRequest({ event : 'init'});
}

function Load()
{
    LoadElementName('timer', default_timer);
    LoadElementName('exclude_url', default_exclude_url);
}

function Run()
{
    // �e�L�X�g�̐ݒ�
    for (var i = 0; i < locale_i18n.length; i++) {
        var el      = document.getElementsByClassName(locale_i18n[i] + 'Text');
        var message = chrome.i18n.getMessage(locale_i18n[i]);
        for (var j = 0; j < el.length; j++) {
            var string      = el[j].innerHTML;
            var index       = string.lastIndexOf('</');
            el[j].innerHTML = string.substring(0, index) + message
                                    + string.substring(index);
        }
    }

    // �f�[�^�ǂݍ���
    Load();
}

document.addEventListener('DOMContentLoaded', function() {
    Run();

    document.querySelector('#init').addEventListener('click', InitDefault);
    document.querySelector('#save').addEventListener('click', Save);
    document.querySelector('#load').addEventListener('click', Load);
});
