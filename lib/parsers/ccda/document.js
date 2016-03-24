/*
 * Parser for the CCDA document section
 */

Parsers.CCDA.document = function (ccda) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var parseAddress = Documents.parseAddress;
    var parsePhones = Documents.parsePhones;
    var parseIds = Documents.parseIds;

    var data = {}, el;

    var doc = ccda.section('document');

    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val());

    var author = doc.tag('author');
    var assigned_author_oid = author.tag('assignedAuthor').tag('id');
    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el);

    var author_npi = author.tag('assignedAuthor').tag('id').attr('extension');

    el = author.tag('addr');
    var address_dict = parseAddress(el);

    el = author.tag('assignedAuthor').immediateChildrenTags('telecom');
    var author_phones = parsePhones(el);

    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');
    for (var i = 0; i < performers.length; i++) {
        el = performers[i];
        var performer_name_dict = parseName(el);
        var performer_phones = parsePhones(el.elsByTag('telecom'));

        console.log('CCDA');
        console.log(el.tag('telecom').attr('value'));
        console.log(el.elsByTag('telecom'));

        var performer_addr = parseAddress(el.tag('addr'));

        documentation_of_list.push({
            name: performer_name_dict,
            phones: performer_phones,
            address: performer_addr
        });
    }

    el = doc.tag('legalAuthenticator');

    var legal_date = parseDate(el.tag('time').attr('value'));
    var legal_assigned_person = parseName(el.tag('assignedEntity').tag('assignedPerson').tag('name'));
    var legal_org_address = parseAddress(el.tag('assignedEntity').tag('addr'));

    var el2 = el.tag('assignedEntity').immediateChildrenTags('id');
    var legal_ids = parseIds(el2);

    var idEl = el.tag('representedOrganization').immediateChildrenTags('id');
    var legal_org_ids = parseIds(idEl);

    var legal_org_name = el.tag('representedOrganization').tag('name').val();

    var phonesEl = el.tag('assignedEntity').immediateChildrenTags('telecom');
    var legal_org_phones = parsePhones(phonesEl);


    el = doc.tag('encompassingEncounter').tag('location');
    var location_name = Core.stripWhitespace(el.tag('name').val());
    var location_addr_dict = parseAddress(el.tag('addr'));

    var encounter_date = null;
    el = el.tag('effectiveTime');
    if (!el.isEmpty()) {
        encounter_date = parseDate(el.attr('value'));
    }

    var custodianName = doc.tag('custodian').tag('assignedCustodian').tag('representedCustodianOrganization').tag('name').val();


    data = {
        custodian: {
            name: custodianName
        },
        date: date,
        title: title,
        author: {
            npi: author_npi,
            name: name_dict,
            address: address_dict,
            phones: author_phones
        },
        documentation_of: documentation_of_list,
        legal_authenticator: {
            date: legal_date,
            ids: legal_ids,
            assigned_person: legal_assigned_person,
            representedOrganization: {
                ids: legal_org_ids,
                name: legal_org_name,
                phones: legal_org_phones,
                address: legal_org_address
            }
        },
        location: {
            name: location_name,
            address: location_addr_dict,
            encounter_date: encounter_date
        }
    };

    return data;
};
