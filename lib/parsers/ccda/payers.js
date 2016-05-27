/*
 * Parser for the CCDA payer section
 */

Parsers.CCDA.payers = function (ccda) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var data = [], el;

    var payers = ccda.section('payers').elsByTag('entry');

    for (var i = 0; i < payers.length; i++) {

        var insurance = payers[i]
            .tag('performer')
            .tag('representedOrganization')
            .tag('name')
            .val();

        var policy_type = payers[i].tag('participant')
            .tag('code')
            .attr('displayName');

        var policy_id = payers[i]
            .tag('entryRelationship')
            .tag('id')
            .attr('extension');

        var relation = payers[i]
            .tag('participant')
            .tag('code')
            .attr('code');

        var subscriber = payers[i]
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
            expiration: expiration
        });
    }

    return data;
};
