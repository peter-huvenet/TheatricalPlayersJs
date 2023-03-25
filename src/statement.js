const formatToUsd = (num) => new Intl.NumberFormat("en-US",
    {
        style: "currency", currency: "USD",
        minimumFractionDigits: 2
    }).format(num / 100);

const calculateAmount = (plays, performance) => {
    const play = plays[performance.playID];
    const audience = performance.audience;
    switch (play.type) {
        case "tragedy":
            return 40000 + 1000 * Math.max(audience - 30, 0);
        case "comedy":
            return 30000 + 300 * audience + (audience > 20 ? 500 * audience : 0);
        default:
            throw new Error(`unknown type: ${play.type}`);
    }
};
const calculateVolumeCredit = (plays, performance) => {
    const play = plays[performance.playID];
    const audience = performance.audience;
    let volumeCredit = Math.max(audience - 30, 0);
    switch (play.type) {
        case "tragedy":
            return volumeCredit;
        case "comedy":
            return volumeCredit + Math.floor(audience / 5);
        default:
            throw new Error(`unknown type: ${play.type}`);
    }
};

const calculateInvoice = (invoice, plays) => {
    const result = {
        customer: invoice.customer,
        totalAmount: 0,
        volumeCredits: 0,
        performances: []
    };
    invoice.performances.forEach(v => {
        const performance = {...v};
        performance.amount = calculateAmount(plays, performance);
        result.performances.push(performance);
        result.totalAmount += performance.amount;
        result.volumeCredits += calculateVolumeCredit(plays, performance);
    });
    return result;
};

const makeStatement = (invoice, plays) => {
    let result = `Statement for ${invoice.customer}\n`;
    invoice.performances.forEach(v => result += ` ${plays[v.playID].name}: ${formatToUsd(v.amount)} (${v.audience} seats)\n`);
    result += `Amount owed is ${formatToUsd(invoice.totalAmount)}\n`;
    result += `You earned ${invoice.volumeCredits} credits\n`;
    return result;
};

const statement = (invoice, plays) => {
    return makeStatement(calculateInvoice(invoice, plays), plays);
};

module.exports = statement;
