/*
 * Parser for the C32 payer section
 */

Parsers.C32.payers = function (c32) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var data = [], el;
    var payers = c32.section('payers');

    payers.entries().each(function(entry) {

        var insurance = entry
            .tag('performer')
            .tag('representedOrganization')
            .tag('name')
            .val();

        var policy_type = entry
            .tag('participant')
            .tag('code')
            .attr('displayName');

        var policy_id = entry
            .tag('entryRelationship')
            .tag('id')
            .attr('extension');

        var relation = entry
            .tag('participant')
            .tag('code')
            .attr('code');

        var subscriber = entry
            .tag('participant')
            .tag('playingEntity')
            .tag('name')
            .val();

        var dateLow = parseDate(el
            .tag('participant')
            .tag('time')
            .tag('low')
            .attr('value'));
        
        console.log(dateLow);

        if (subscriber) {
            subscriber = subscriber
                .replace(/(\r\n|\n|\r)/gm, "") //remove escaped chars
                .replace(/\s+/g, " ") //remove more than 1 space in between words
                .replace(/^\s+|\s+$/g, ""); // trim beginning and end
        }


        var expiration;

        data.push({
            insurance: insurance,
            policy_type: policy_type,
            policy_id: policy_id,
            relation: relation,
            subscriber: subscriber,
            expiration: expiration
        });
    });

    return data;
};
