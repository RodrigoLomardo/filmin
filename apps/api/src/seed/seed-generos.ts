import dataSource from 'src/database/data-source';
import { Genero } from 'src/modules/generos/entities/genero.entity';
import { GENEROS_PADRAO } from './generos-padrao';

async function seedGeneros() {
  await dataSource.initialize();

  const repository = dataSource.getRepository(Genero);

  for (const nome of GENEROS_PADRAO) {
    const generoExistente = await repository.findOne({
      where: { nome },
    });

    if (!generoExistente) {
      const genero = repository.create({ nome });
      await repository.save(genero);
    }
  }

  await dataSource.destroy();
  console.log('Seed de gêneros executada com sucesso.');
}

seedGeneros().catch((error) => {
  console.error('Erro ao executar seed de gêneros:', error);
  process.exit(1);
});
