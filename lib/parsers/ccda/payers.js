/*
 * Parser for the CCDA payer section
 */

Parsers.CCDA.payers = function (ccda) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var data = [], el;

    var payers = ccda.section('payers');

    payers.entries().each(function (entry) {


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
            date_range: {
                start: null,
                end: null
            }
        });

    });

    return data;
};
