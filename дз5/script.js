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

printList(list, document.getElementsByTagName('body')[0]);

function printList(list, block) {
    let ul = document.createElement('ul');
    block.appendChild(ul);

    for (let child of list) {
        let li = document.createElement('li');
        let text = document.createTextNode(child['text']);
        li.appendChild(text);
        ul.appendChild(li);
        if (child['childs']) {
            printList(child['childs'], li);
        }
    }
}


function info(element) {
    console.log(element);
    for (child of element.children) {
        info(child);
    }
}

info(document.documentElement)