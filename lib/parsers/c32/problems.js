/*
 * Parser for the C32 problems section
 */

Parsers.C32.problems = function (c32) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var parseAddress = Documents.parseAddress;
    var data = [], el;

    var problems = c32.section('problems');

    problems.entries().each(function (entry) {

        var reference = entry.tag('reference').attr('value');

        var referenceTitle = entry.tag('text').val();

        el = entry.tag('effectiveTime');
        var start_date = parseDate(el.tag('low').attr('value')),
            end_date = parseDate(el.tag('high').attr('value'));

        el = entry.template('2.16.840.1.113883.10.20.1.28').tag('value');
        var name = el.attr('displayName'),
            code = el.attr('code'),
            code_system = el.attr('codeSystem'),
            code_system_name = el.attr('codeSystemName');

        // Pre-C32 CCDs put the problem name in this "originalText" field, and some vendors
        // continue doing this with their C32, even though it's not technically correct
        if (!name) {
            el = entry.template('2.16.840.1.113883.10.20.1.28').tag('originalText');
            if (!el.isEmpty()) {
                name = Core.stripWhitespace(el.val());
            }
        }

        var els = entry.template('2.16.840.1.113883.10.20.1.28').elsByTag('translation');

        var translations = [];

        if (!els.isEmpty) {
            translations = els.map(function (el) {
                return {
                    name: el.attr('displayName'),
                    code: el.attr('code'),
                    code_system: el.attr('codeSystem'),
                    code_system_name: el.attr('codeSystemName')
                }
            });
        }

        el = entry.template('2.16.840.1.113883.10.20.1.50');
        var status = el.tag('value').attr('displayName');

        var age = null;
        el = entry.template('2.16.840.1.113883.10.20.1.38');
        if (!el.isEmpty()) {
            age = parseFloat(el.tag('value').attr('value'));
        }

        data.push({
            reference: reference,
            reference_title: referenceTitle,
            date_range: {
                start: start_date,
                end: end_date
            },
            name: name,
            status: status,
            age: age,
            code: code,
            code_system: code_system,
            code_system_name: code_system_name,
            translations: translations,
            comment: null // not part of C32
        });
    });

    return data;
};
