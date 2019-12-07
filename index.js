const telegraf = require('telegraf')
const markup = require('telegraf/markup')
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const Converter = require("./api/currency_converter");

const bot = new telegraf('777')
// bot.start((ctx) => ctx.reply(`welcome ${ctx.from.first_name}!`))
bot.start((ctx) => ctx.reply(
    `welcome, how can i help you ${ctx.from.first_name}!`,
    markup.inlineKeyboard([
        markup.callbackButton("convert currency", "CONVERT_CURRENCY"),
        markup.callbackButton("view rates", "VIEW_RATES")
    ]).extra()
)
)

//currency converter wizard
const currencyConverter = new WizardScene(
    "currency_converter",
    ctx => {
        ctx.reply("pelase, type in the currency to convert from(example: USD)");
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencySource = ctx.message.text;
        ctx.reply(
            `got it, you wish to convert from ${
            ctx.wizard.state.currencySource
            } to what currency? (example:EUR)`
        );
        //go to the following scene
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencyDestination = ctx.message.text;
        ctx.reply(
            `enter the amount to convert from ${ctx.wizard.state.currencySource} to ${
            ctx.wizard.state.currencyDestination
            }`
        );
        return ctx.wizard.next();
    },
    ctx => {
        const amt = (ctx.wizard.state.amount = ctx.message.text);
        const source = ctx.wizard.state.currencySource;
        const dest = ctx.wizard.state.currencyDestination;
        const rates = Converter.getRate(source, dest);
        rates.then(
            res => {
                let newAmount = Object.values(res.data)[0] * amt;
                newAmount = newAmount.toFixed(3).toString();
                ctx.reply(
                    `${amt} ${source} is worth \n${newAmount} ${dest}`,
                    markup.inlineKeyboard([
                        markup.callbackButton("back to menu", "BACK"),
                        markup.callbackButton("convert another currency", "CONVERT_CURRENCY")
                    ]).extra()
                );
            }
        );
        return ctx.scene.leave();

    }
);

bot.action("BACK", ctx => {
    ctx.reply(`Glad I could help`);
    ctx.reply(
        `Do you need something else, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
            Markup.callbackButton("💱 Convert Currency", "CONVERT_CURRENCY"),
            Markup.callbackButton("🤑 View Rates", "VIEW_RATES")
        ]).extra()
    );
});
//scene registration
const stage = new Stage([currencyConverter], { default: "currency_converter" });
bot.use(session());
bot.use(stage.middleware());

bot.startPolling();