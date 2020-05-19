let list = [
    {
        text: 'Животные',
        childs: [
            {
                text: 'Млекопитающие',
                childs: [
                    {
                        text: 'Коровы'
                    },
                    {
                        text: 'Ослы'
                    },
                    {
                        text: 'Собаки'
                    },
                    {
                        text: 'Тигры'
                    }
                ]
            },
            {
                text: 'Другие',
                childs: [
                    {
                        text: 'Змеи'
                    },
                    {
                        text: 'Птицы'
                    },
                    {
                        text: 'Ящерицы'
                    }
                ]
            }
        ]
    },
    {
        text: 'Рыбы',
        childs: [
            {
                text: 'Аквариумные',
                childs: [
                    {
                        text: 'Гуппи'
                    },
                    {
                        text: 'Скалярии'
                    }
                ]
            },
            {
                text: 'Морские',
                childs: [
                    {
                        text: 'Морская форель'
                    }
                ]
            }
        ]
    }
]

printList(list, $('body'));

function printList(list, block) {
    let ul = $('<ul>').appendTo(block);
    for (let child of list) {
        let li = $('<li>', { text: child['text'] }).appendTo(ul);
        if (child['childs']) {
            printList(child['childs'], li);
        }
    }
}

$('li').each(function () {
    console.log($(this).contents()[0], $(this).find('li').length);
});

$('li').click(function () {
    $(this).contents().slideToggle('fast');
    // если не вернуть false, то событие не остановится
    return false;
});