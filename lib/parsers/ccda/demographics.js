/*
 * Parser for the CCDA demographics section
 */

Parsers.CCDA.demographics = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var parsePhones = Documents.parsePhones;
  var parseIds = Documents.parseIds;
  var data = {}, el;
  
  var demographics = ccda.section('demographics');
  
  var patient = demographics.tag('patientRole');
  el = patient.tag('patient').tag('name');
  var patient_name_dict = parseName(el);

  var ids = patient.elsByTag('id');

  var mrn_number = patient.tag('id').attr('extension');

  var document_ids = [];

  for (var i = 0; i < ids.length; i++) {
      if (ids[i].attr('assigningAuthorityName') === null) {
          continue;
      }

      if (ids[i].attr('assigningAuthorityName').toLowerCase() == 'mrn') {
          mrn_number = ids[i].attr('extension');
      }

      document_ids.push({
          name: ids[i].attr('assigningAuthorityName').toLowerCase(),
          id: ids[i].attr('extension'),
      });
  }

  el = patient.tag('patient');
  var dob = parseDate(el.tag('birthTime').attr('value')),
      gender = Core.Codes.gender(el.tag('administrativeGenderCode').attr('code')),
      marital_status = Core.Codes.maritalStatus(el.tag('maritalStatusCode').attr('code'));
  
  el = patient.tag('addr');
  var patient_address_dict = parseAddress(el);

  el = patient.immediateChildrenTags('telecom');

  var phones = parsePhones(el);

  /**
   * This works for an aprima CCDA
   *
   * @todo: Put this in the helpers file
   * @param telecoms
   * @returns {string}
   */
  var parseEmail = function (telecoms) {
    if (! telecoms.length > 0) {
      return null;
    }

    for (var i = 0; i < telecoms.length; i++) {
      var telecomValue = telecoms[i].attr('value');

      if (telecomValue == null) {
        continue;
      }

      if (! (telecomValue.indexOf('@') > -1)) {
        continue;
      }

      if (telecomValue.indexOf(':') > -1) {
        var exploded = telecomValue.split(':');
        return exploded[1].toString();
      }

      return telecomValue.toString();
    }
  };

  var parsedEmail = parseEmail(el);
  var email = parsedEmail ? parsedEmail : null;

  var language = patient.tag('languageCommunication').tag('languageCode').attr('code'),
      race = patient.tag('raceCode').attr('displayName'),
      ethnicity = patient.tag('ethnicGroupCode').attr('displayName'),
      religion = patient.tag('religiousAffiliationCode').attr('displayName');
  
  el = patient.tag('birthplace');
  var birthplace_dict = parseAddress(el);
  
  el = patient.tag('guardian');
  var guardian_relationship = el.tag('code').attr('displayName'),
      guardian_relationship_code = el.tag('code').attr('code'),
      guardian_home = el.tag('telecom').attr('value');
  
  el = el.tag('guardianPerson').tag('name');
  var guardian_name_dict = parseName(el);
  
  el = patient.tag('guardian').tag('addr');
  var guardian_address_dict = parseAddress(el);
  
  el = patient.tag('providerOrganization');
  var provider_organization = el.tag('name').val(),
      provider_phones = parsePhones(el.immediateChildrenTags('telecom')),
      provider_ids = parseIds(el.immediateChildrenTags('id')),
      provider_address_dict = parseAddress(el.tag('addr'));

  el = demographics.immediateChildrenTags('participant');

  var patient_contacts = el.map(function(tag) {
    tag = tag.tag('associatedEntity');

    return {
      relationship: Core.Codes.role(tag.attr('classCode')),
        relationship_code: {
        code: tag.tag('code').attr('code'),
        displayName: tag.tag('code').attr('displayName'),
      },
      phones: parsePhones(tag.immediateChildrenTags('telecom')),
      name: parseName(tag.tag('associatedPerson').tag('name'))
    }
  });
  
  data = {
    ids: document_ids,
    name: patient_name_dict,
    dob: dob,
    gender: gender,
    mrn_number: mrn_number,
    marital_status: marital_status,
    address: patient_address_dict,
    phones: phones,
    email: email,
    language: language,
    race: race,
    ethnicity: ethnicity,
    religion: religion,
    birthplace: {
      state: birthplace_dict.state,
      zip: birthplace_dict.zip,
      country: birthplace_dict.country
    },
    guardian: {
      name: {
        given: guardian_name_dict.given,
        family: guardian_name_dict.family
      },
      relationship: guardian_relationship,
      relationship_code: guardian_relationship_code,
      address: guardian_address_dict,
      phone: {
        home: guardian_home
      }
    },
    patient_contacts: patient_contacts,
    provider: {
        ids: provider_ids,
        organization: provider_organization,
      phones: provider_phones,
      address: provider_address_dict
    }
  };
  
  return data;
};
