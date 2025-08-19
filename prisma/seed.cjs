const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
    const a1 = await prisma.artist.create({ data: { name: 'Nujabes' }});
    const a2 = await prisma.artist.create({ data: { name: 'J Dilla' }});

    const t1 = await prisma.track.create({ data: { title: 'Feather', artistId: a1.id }});
    await prisma.track.create({ data: { title: 'Luv(sic) pt3', artistId: a1.id }});
    await prisma.track.create({ data: { title: 'Time: The Donut of the Heart', artistId: a2.id }});
    await prisma.track.create({ data: { title: 'Mash', artistId: a2.id }});

    await prisma.rating.create({ data: { score: 4.5, trackId: t1.id }});
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });