import React, { useEffect, useState } from 'react'
import { Table } from 'antd';
import './index.css'

import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from '../../firebase'
export const db = getFirestore();

function Home() {

    const rate = [
        'AAA+', 'AAA', 'AAA-', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-',
        'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-',
        'CCC+', 'CCC', 'CCC-', 'CC+', 'CC', 'CC-', 'C+', 'C', 'C-',
    ]

    const sorting = (a, b) => {
        if (rate.indexOf(b) > rate.indexOf(a)) {
            return 1;
        }
        if (rate.indexOf(b) < rate.indexOf(a)) {
            return -1;
        }
        return 0;
    }

    const columns = [
        {
            title: "Наименование банка",
            dataIndex: "name",
            fixed: 'left',
        },
        {
            title: "Размер $млн",
            dataIndex: "capitalization",
            defaultSortOrder: 'descend',
            sorter: {
                compare: (a, b) => a.capitalization - b.capitalization,
                multiple: 4,
            },
            render: number => thousandSeparator(number),
        },
        {
            title: "Владелец",
            dataIndex: "owner",
        },
        {
            title: "Рейтинг форума",
            dataIndex: "forumRate",
            sorter: {
                compare: (a, b) => {
                    if (rate.indexOf(b.forumRate) > rate.indexOf(a.forumRate)) {
                        return 1;
                    }
                    if (rate.indexOf(b.forumRate) < rate.indexOf(a.forumRate)) {
                        return -1;
                    }
                    return 0;
                },
                multiple: 10,
            },
        },
        {
            title: "Рейтинг S&P500, Fitch, Moody's",
            dataIndex: "journalRate",
            sorter: {
                compare: (a, b) => {
                    if (rate.indexOf(b.forumRate) > rate.indexOf(a.forumRate)) {
                        return 1;
                    }
                    if (rate.indexOf(b.forumRate) < rate.indexOf(a.forumRate)) {
                        return -1;
                    }
                    return 0;
                },
                multiple: 8,
            },
        },
        {
            title: "Живые деньги",
            dataIndex: "realMoney",
            sorter: {
                compare: (a, b) => a.realMoney.replace(/%/, "") - b.realMoney.replace(/%/, ""),
                multiple: 8,
            },
        },
        {
            title: "Живые деньги (min)",
            dataIndex: "realMoneyMin",
            sorter: {
                compare: (a, b) => a.realMoneyMin.replace(/%/, "") - b.realMoneyMin.replace(/%/, ""),
                multiple: 6,
            },
        },
        {
            title: "Дыра капитала",
            dataIndex: "capitalHole",
            defaultSortOrder: 'ascend',
            sorter: {
                compare: (a, b) => a.capitalHole.replace(/%/, "") - b.capitalHole.replace(/%/, ""),
                multiple: 5,
            },
            render: number => (
                Number(number.replace(/%/, "")) === 0 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Качество займов",
            dataIndex: "loanQuality",
            sorter: {
                compare: (a, b) => a.loanQuality - b.loanQuality,
                multiple: 4,
            },
        },
        {
            title: "Аппетит к риску",
            dataIndex: "appetiteRisk",
            sorter: {
                compare: (a, b) => a.appetiteRisk.replace(/%/, "") - b.appetiteRisk.replace(/%/, ""),
                multiple: 3,
            },
        },
        {
            title: "Доля рынка",
            dataIndex: "marketShare",
            sorter: {
                compare: (a, b) => a.marketShare.replace(/%/, "") - b.marketShare.replace(/%/, ""),
                multiple: 9,
            },
        },
        {
            title: "Доля ритейла",
            dataIndex: "retailShare",
            sorter: {
                compare: (a, b) => a.retailShare.replace(/%/, "") - b.retailShare.replace(/%/, ""),
                multiple: 4,
            },
        },
        {
            title: "Бумажные",
            children: [
                {
                    title: "NPL",
                    dataIndex: "npl",
                    sorter: {
                        compare: (a, b) => a.npl.replace(/%/, "") - b.npl.replace(/%/, ""),
                        multiple: 6,
            },
                },
                {
                    title: "Капитал",
                    dataIndex: "capital",
                    sorter: {
                        compare: (a, b) => a.capital.replace(/%/, "") - b.capital.replace(/%/, ""),
                        multiple: 2,
            },
                },
                {
                    title: "Профит",
                    dataIndex: "profit",
                    sorter: {
                        compare: (a, b) => a.profit.replace(/%/, "") - b.profit.replace(/%/, ""),
                        multiple: 2,
            },
                },
            ]
        },
        {
            title: "Активы",
            dataIndex: "assets",
            defaultSortOrder: 'descend',
            sorter: {
                compare: (a, b) => a.assets - b.assets,
                multiple: 4,
            },
            render: number => (
                number > 0 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Вклады",
            dataIndex: "deposits",
            sorter: {
                compare: (a, b) => a.deposits - b.deposits,
                multiple: 4,
            },
            render: number => (
                number > 0 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
    ]

    const [data, setData] = useState([])

    async function fetchBanks() {
        const banksRef = collection(db, "banks");
        const querySnapshot = await getDocs(banksRef);
        querySnapshot.forEach((doc) => {
            setData(prev => [...prev, doc.data()]);
        });
    }

    function onChange(pagination, filters, sorter, extra) {
        console.log('params', pagination, filters, sorter, extra);
    }

    var thousandSeparator = function (str) {
        var parts = (str + '').split('.'),
            main = parts[0],
            len = main.length,
            output = '',
            i = len - 1;
        while (i >= 0) {
            output = main.charAt(i) + output;
            if ((len - i) % 3 === 0 && i > 0) {
                output = ' ' + output;
            }
            --i;
        }
        if (parts.length > 1) {
            output += '.' + parts[1];
        }
        return output;
    };

    useEffect(() => {
        fetchBanks()
    }, [])

    return (
        <div className="home">
            <Table columns={columns} dataSource={data} onChange={onChange} showSorterTooltip={false} pagination={false}/>
        </div>
    )
}

export default Home