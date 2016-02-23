/*
 * Parser for the C32 document section
 */

Parsers.C32.document = function (c32) {

    var parseDate = Documents.parseDate;
    var parseName = Documents.parseName;
    var parseAddress = Documents.parseAddress;
    var parseIds = Documents.parseIds;
    var parsePhones = Documents.parsePhones;

    var data = {}, el;

    var doc = c32.section('document');

    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val());

    var author = doc.tag('author');

    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el);

    /**
     * Just for uniformity with CCDA
     * @type {null}
     */
    var author_npi = null;

    // Sometimes C32s include names that are just like <name>String</name>
    // and we still want to get something out in that case
    if (!name_dict.prefix && !name_dict.given.length && !name_dict.family) {
        name_dict.family = el.val();
    }

    el = author.tag('addr');
    var address_dict = parseAddress(el);

    el = author.tag('assignedAuthor').immediateChildrenTags('telecom');
    var author_phones = parsePhones(el);

    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');
    for (var i = 0; i < performers.length; i++) {
        el = performers[i].tag('assignedPerson').tag('name');
        var performer_name_dict = parseName(el);
        var performer_phone = performers[i].tag('telecom').attr('value');
        var performer_addr = parseAddress(el.tag('addr'));
        var npi = performers[i].tag('assignedEntity').tag('id').attr('extension');

        documentation_of_list.push({
            npi: npi,
            name: performer_name_dict,
            phone: {
                work: performer_phone
            },
            address: performer_addr
        });
    }

    el = doc.tag('legalAuthenticator');

    var legal_date = parseDate(el.tag('time').attr('value'));
    var legal_assigned_person = parseName(el.tag('assignedPerson').tag('name'));
    var legal_org_address = parseAddress(el.tag('representedOrganization').tag('addr'));

    var el2 = el.tag('assignedEntity').immediateChildrenTags('id');
    var legal_ids = parseIds(el2);

    var idEl = el.tag('representedOrganization').immediateChildrenTags('id');
    var legal_org_ids = parseIds(idEl);

    var legal_org_name = el.tag('representedOrganization').tag('name').val();

    var phonesEl = el.tag('representedOrganization').immediateChildrenTags('telecom');
    var legal_org_phones = parsePhones(phonesEl);

    el = doc.tag('encompassingEncounter');
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
