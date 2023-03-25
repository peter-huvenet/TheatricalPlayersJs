const formatToUsd = (num) => new Intl.NumberFormat("en-US",
    {
        style: "currency", currency: "USD",
        minimumFractionDigits: 2
    }).format(num / 100);

class PerformanceCalculator {
    constructor(audience) {
        this.audience = audience;
    }
}

class TragedyCalculator extends PerformanceCalculator {
    get amount() {
        return 40000 + 1000 * Math.max(this.audience - 30, 0);
    };

    get volumeCredit() {
        return Math.max(this.audience - 30, 0);
    };
}

class ComedyCalculator extends PerformanceCalculator {
    get amount() {
        return 30000 + 300 * this.audience + (this.audience > 20 ? 500 * this.audience : 0);
    };

    get volumeCredit() {
        return Math.max(this.audience - 30, 0) + Math.floor(this.audience / 5);
    };
}

const calculatorFactory = (performance, plays) => {
    const type = plays[performance.playID].type;
    switch (type) {
        case "tragedy":
            return new TragedyCalculator(performance.audience);
        case "comedy":
            return new ComedyCalculator(performance.audience);
        default:
            throw new Error(`unknown type: ${type}`);
    }
};
const calculateInvoice = (invoice, plays) => {
    const performances = [];
    invoice.performances.forEach(v => {
        const calculator = calculatorFactory(v, plays);
        performances.push({
            amount: calculator.amount,
            volumeCredit: calculator.volumeCredit,
            name: plays[v.playID].name,
            audience: v.audience
        });
    });
    return {
        customer: invoice.customer,
        performances: performances,
        totalAmount: performances.reduce((total, v) => total + v.amount, 0),
        volumeCredits: performances.reduce((total, v) => total + v.volumeCredit, 0)
    };
};

const makeStatement = (invoice) => {
    let result = `Statement for ${invoice.customer}\n`;
    invoice.performances.forEach(v => result += ` ${v.name}: ${formatToUsd(v.amount)} (${v.audience} seats)\n`);
    result += `Amount owed is ${formatToUsd(invoice.totalAmount)}\n`;
    result += `You earned ${invoice.volumeCredits} credits\n`;
    return result;
};

const statement = (invoice, plays) => {
    return makeStatement(calculateInvoice(invoice, plays));
};

module.exports = statement;
