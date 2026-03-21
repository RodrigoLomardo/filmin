import dataSource from 'src/database/data-source';
import { Genero } from 'src/modules/generos/entities/genero.entity';

async function seedGeneros() {
  await dataSource.initialize();

  const repository = dataSource.getRepository(Genero);

  const generos = [
    'Ação',
    'Aventura',
    'Animação',
    'Comédia',
    'Crime',
    'Documentário',
    'Drama',
    'Fantasia',
    'Ficção Científica',
    'Romance',
    'Suspense',
    'Terror',
  ];

  for (const nome of generos) {
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