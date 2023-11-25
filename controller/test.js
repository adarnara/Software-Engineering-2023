const { NlpManager, ConversationContext } = require('node-nlp');

async function main() {
    const manager = new NlpManager({ languages: ['en'] });

    manager.addDocument(
        'en',
        'I saw %hero_1% together with %hero_2%, they where eating %food%',
        'saw_heroes_eating'
    );

    await manager.train();

    manager.addNamedEntityText('hero', 'spiderman', ['en'], ['Spider-man']);
    manager.addNamedEntityText('hero', 'iron man', ['en'], ['iron man']);
    manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
    manager.addNamedEntityText('food', 'burguer', ['en'], ['Burguer']);
    manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
    manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);

    manager.slotManager.addSlot('saw_heroes_eating', 'hero_1', true, { en: 'Who did you see?' });
    manager.slotManager.addSlot('saw_heroes_eating', 'hero_2', true, { en: 'With whom did you see {{ hero_1 }}?' });
    manager.slotManager.addSlot('saw_heroes_eating', 'food', true, { en: 'What where they eating?' });

    manager.addAnswer('en', 'saw_heroes_eating', 'Wow! You saw {{ hero_1 }} and {{ hero_2 }} eating {{ food }}!');

    const result1 = await manager.process('I saw spiderman together with ironman, they where eating spaghetti');
    console.log(result1.answer);

    const result2 = await manager.process('I saw iron-man and the other hero, they where eating a burger');
    console.log(result2.answer);

    const result3 = await manager.process('I saw him together with thor, they where eating pizza');
    console.log(result3.answer);

    const result4 = await manager.process('I saw iron-man together with thor, they where eating');
    console.log(result4.answer);

    const result5 = await manager.process('I saw them together, they where eating');
    console.log(result5.answer);

    // Console output:
    // Wow! You saw spiderman and iron man eating pasta!
    // With whom did you see iron man?
    // With whom did you see thor?
    // What where they eating?
    // Who did you see?
}

main();