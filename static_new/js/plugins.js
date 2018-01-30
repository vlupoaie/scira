/**
 * Created by vlupoaie on 7/12/2016.
 */

basic_rule = '<h4><label class="col-md-1 control-label close-label">Name:&nbsp;&nbsp;</label></h4><div ' +
    'class="col-md-2"><input class="form-control styled-content-red slightly-larger" style="width: 112%; ' +
    'margin-left: -10%;" type="text" name="rule_name_" ' +
    'placeholder="Rule name" title="Name used to uniquely identify a rule in the filter field" required></div><h4>' +
    '<label class="col-md-1 control-label close-label">Attribute:</label></h4><div class="col-md-2"><select ' +
    'style="padding: 3px 6px" class="form-control styled-content" name="rule_attribute_" ' +
    'onchange="optionsChanged(this)" title="Attribute of files to be checked" required><option value=""' +
    ' style="color: #666;" disabled selected hidden>Target attribute</option><option disabled>&nbsp;</option>' +
    '<option value="size">File Size</option><option value="first_seen">' +
    'First Seen</option><option value="last_seen">Last Seen</option><option value="engines_count">Engines Count' +
    '</option><option value="positives">Positives</option><option value="times_submitted">Times submitted</option>' +
    '<option disabled>----------------------------------</option>' +
    '<option value="name">File Name</option><option value="country">Country</option>' +
    '<option value="region">Region</option><option value="city">City</option>' +
    '<option value="interface">Interface</option><option value="submitter">Submitter</option><option value="type">' +
    'File Type</option><option disabled>----------------------------------</option><option value="md5">File MD5' +
    '</option><option value="sha1">File SHA1</option><option value="sha256">File SHA256</option><option disabled>' +
    '----------------------------------</option><option value="detections">Detections</option>' +
    '<option value="tags">File Tags</option><option value="itw_urls">ITW URLs</option>' +
    '<option value="names">File Names</option><option disabled>&nbsp;</option></select></div>' +
    '<h4><label class="col-md-1 control-label close-label">Operator:</label></h4><div class="col-md-1">' +
    '<select style="padding: 3px 5px" class="form-control larger styled-content empty" name="rule_operator_" ' +
    'onchange="removeEmpty(this)" title="Operator for the target attribute and value" required><option value=""' +
    ' style="color: #666;" disabled selected hidden>Operator</option></select></div><h4><label ' +
    'class="col-md-1 control-label last">Value:</label></h4><div class="col-md-2 last-input"><input ' +
    'class="form-control styled-content" type="text" name="rule_value_" placeholder="Target value" ' +
    'title="Value for the attribute to be checked against" required></div><div class="col-md-1"><span ' +
    'class="glyphicon glyphicon-remove-circle remove-btn" aria-hidden="true" onclick="deleteRule(this)"></span></div>';

var select_options = {
    'size': ['<', '<=', '>', '>=', '==', '!='],
    'first_seen': ['<', '<=', '>', '>=', '==', '!='],
    'last_seen': ['<', '<=', '>', '>=', '==', '!='],
    'positives': ['<', '<=', '>', '>=', '==', '!='],
    'times_submitted': ['<', '<=', '>', '>=', '==', '!='],
    'country': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'region': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'city': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'interface': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'submitter': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'type': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'md5': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'sha1': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'sha256': ['like', 'ilike', 'contains', 'icontains', '==', '!='],
    'detections': ['like', 'ilike', 'contains', 'icontains'],
    'tags': ['like', 'ilike', 'contains', 'icontains'],
    'names': ['like', 'ilike', 'contains', 'icontains'],
    'itw_urls': ['like', 'ilike', 'contains', 'icontains'],
};

window.onload = function () {
    recalculateRulesCount();
    chooseRightOperators();
};

function recalculateRulesCount() {
    var all_forms = document.getElementsByTagName('form');
    var counter;
    for (var i = 0; i < all_forms.length; i++) {
        if (hasClass(all_forms[i], 'plugin-form')) {
            var this_form = all_forms[i];
            counter = 0;
            var all_inputs = this_form.getElementsByTagName('input');
            for (var j = 0; j < all_inputs.length; j++) {
                if (all_inputs[j].name.indexOf('rule_name_') > -1) {
                    counter += 1;
                }
            }
            for (var k = 0; k < all_inputs.length; k++) {
                if (all_inputs[k].name === 'rules_count') {
                    all_inputs[k].value = counter;
                    break;
                }
            }
        }
    }
}

function chooseRightOperators() {
    var all_divs = document.getElementsByTagName('div');
    var remember;
    var all_form_groups;
    for (var i = 0; i < all_divs.length; i++) {
        if (hasClass(all_divs[i], 'panel-group')) {
            remember = all_divs[i];
        }
    }

    var all_forms = [];
    var all_forms_collection = remember.getElementsByTagName('form');
    for (i = 0; i < all_forms_collection.length; i++) {
        all_forms.push([all_forms_collection[i], 0]);
    }
    all_forms.push([document.getElementById('add_new_plugin_form'), 1]);
    for (var j = 0; j < all_forms.length; j++) {
        var all_form_divs = all_forms[j][0].getElementsByTagName('div');
        all_form_groups = [];
        for (i = 0; i < all_form_divs.length; i++) {
            if (hasClass(all_form_divs[i], 'form-group')) {
                all_form_groups.push(all_form_divs[i]);
            }
        }
        var operator_value;
        for (i = 3 - all_forms[j][1]; i < all_form_groups.length; i++) {
            var first_div = all_form_groups[i].getElementsByTagName('div')[0];
            if (first_div.title != 'divHidden') {
                continue;
            }
            operator_value = first_div.textContent;
            var selects = all_form_groups[i].getElementsByTagName('select');
            optionsChanged(selects[0]);
            var these_options = selects[1].options;
            for (var k = 0; k < these_options.length; k++) {
                if (these_options[k].value == operator_value) {
                    selects[1].selectedIndex = k;
                    selects[1].value = these_options[k].value;
                    deleteClass(selects[1], 'empty');
                    break;
                }
            }
        }
    }
}

function hasClass(el, cls) {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function deleteClass(el, cls) {
    if (el.classList)
        el.classList.remove(cls);
    else if (hasClass(el, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

function addClass(el, cls) {
    if (el.classList)
        el.classList.add(cls);
    else if (!hasClass(el, cls)) el.className += " " + cls;
}

function addNewRule(this_node, which) {
    var form_element;
    if (which == 6)
        form_element = this_node.parentNode.parentNode;
    else if (which == 5)
        form_element = this_node.parentNode;
    else
        return false;
    var rule_count_node = form_element.getElementsByTagName('input')[which];
    var rule_count = parseInt(rule_count_node.value) + 1;
    var new_rule = document.createElement('div');
    new_rule.className = 'form-group';
    new_rule.innerHTML = basic_rule;
    var input_elements = new_rule.getElementsByTagName('input');
    for (var i = 0; i < 2; i++) {
        input_elements[i].name += rule_count.toString();
    }
    input_elements = new_rule.getElementsByTagName('select');
    for (i = 0; i < 2; i++) {
        input_elements[i].name += rule_count.toString();
    }
    if (which == 6)
        form_element.insertBefore(new_rule, this_node.parentNode);
    else if (which == 5)
        form_element.insertBefore(new_rule, this_node);
    rule_count_node.value = rule_count;
}

function deleteRule(this_node) {
    var form_group = this_node.parentNode.parentNode;
    var this_form = form_group.parentNode;
    var all_inputs = this_form.getElementsByTagName('input');
    for (var k = 0; k < all_inputs.length; k++) {
        if (all_inputs[k].name === 'rules_count') {
            all_inputs[k].value -= 1;
            break;
        }
    }
    form_group.remove();

    // restoring names
    var all_form_groups = this_form.getElementsByClassName('form-group');
    var counter = 1;
    for (var i = 0; i < all_form_groups.length; i++) {
        var all_these_inputs = all_form_groups[i].getElementsByTagName('input');
        var all_these_selects = all_form_groups[i].getElementsByTagName('select');
        if (all_these_inputs.length == 2 && all_these_selects.length == 2) {
            for (var j = 0; j < all_these_inputs.length; j++) {
                all_these_inputs[j].name = all_these_inputs[j].name.substr(0,
                        all_these_inputs[j].name.lastIndexOf('_') + 1) + counter.toString();
                all_these_selects[j].name = all_these_selects[j].name.substr(0,
                        all_these_selects[j].name.lastIndexOf('_') + 1) + counter.toString();
            }
            counter += 1;
        }
    }
}

function optionsChanged(this_select) {
    var selected_value = this_select.options[this_select.selectedIndex].value;
    var operators_list = select_options[selected_value];
    var select_inner_html = '<option value="" style="color: #666;" disabled selected hidden>' +
        'Operator</option><option disabled>&nbsp;</option>';
    for (var i = 0; i < operators_list.length; i++) {
        select_inner_html += '<option value="' + operators_list[i] + '">' + operators_list[i] + '</option>';
    }
    select_inner_html += '<option disabled>&nbsp;</option>';

    var operators_select = this_select.parentNode.parentNode.getElementsByTagName('select')[1];
    addClass(operators_select, 'empty');
    operators_select.innerHTML = select_inner_html;
}

function removeEmpty(this_select) {
    deleteClass(this_select, 'empty');
}
