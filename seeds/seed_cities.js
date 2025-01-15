exports.seed = async function(knex) {
  await knex('areas').del()

  await knex('areas').insert([
    { city_id: 1, name: 'Satellite Town', morning_delivery: true, evening_delivery: true },
    { city_id: 1, name: 'Bahria Town Phase 7', morning_delivery: true, evening_delivery: true },
    { city_id: 1, name: 'Askari 14', morning_delivery: true, evening_delivery: true },
    { city_id: 1, name: 'PWD Housing Society', morning_delivery: true, evening_delivery: true },
    { city_id: 1, name: 'Gulrez Housing Scheme', morning_delivery: true, evening_delivery: true },

    { city_id: 2, name: 'F-6', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'F-7', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'F-8', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'E-11', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'G-5 Diplomatic Enclave', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'Bahria Enclave', morning_delivery: true, evening_delivery: true },
    { city_id: 2, name: 'DHA Phase 2', morning_delivery: true, evening_delivery: true }
  ]);
};
