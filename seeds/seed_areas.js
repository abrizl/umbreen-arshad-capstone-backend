exports.seed = async function(knex) {
  await knex('cities').del();

  await knex('cities').insert([
    {id: 1, name: 'Rawalpindi'},
    {id: 2, name: 'Islamabad'},
  ]);
};
