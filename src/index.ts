import config from '../ipe-plugin.json'

mw.hook('InPageEdit.toolbox').add(({ $toolbox }) => {
    $toolbox
        .find('.btn-group.group1')
        .append(
            $('<li>', { class: 'btn-tip-group' }).append(
                $('<div>', { class: 'btn-tip', text: config.description }),
                $('<button>',
                    {
                        id: config.name,
                        class: `ipe-toolbox-btn fa ${config.icon} ipe-trapper`
                    })
                    .click(main)
            )
        );
    mw.util.addCSS(`
        #${config.name} {
            background: #845EC2 !important;
        }
    `);
});
async function main() {
    console.log("Hello world? 2")
}