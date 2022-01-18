import React, { useEffect, useState } from 'react'
import { Table, Popover } from 'antd';
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
            width: 135.5,
        },
        {
            title: "Размер $млн",
            dataIndex: "capitalization",
            defaultSortOrder: 'descend',
            width: 94.8,
            sorter: {
                compare: (a, b) => a.capitalization - b.capitalization,
                multiple: 4,
            },
            render: number => thousandSeparator(number),
        },
        {
            title: "Владелец",
            dataIndex: "owner",
            width: 125,
            render: name => getOwner(name),
        },
        {
            title: "Рейтинг форума",
            dataIndex: "forumRate",
            defaultSortOrder: 'descend',
            width: 99,
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
            width: 102,
            sorter: {
                compare: (a, b) => {
                    if (rate.indexOf(b.journalRate) > rate.indexOf(a.journalRate)) {
                        return 1;
                    }
                    if (rate.indexOf(b.journalRate) < rate.indexOf(a.journalRate)) {
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
            width: 92,
            sorter: {
                compare: (a, b) => a.realMoney.replace(/%/, "") - b.realMoney.replace(/%/, ""),
                multiple: 8,
            },
            render: number => (
                Number(number.replace(/%/, "")) > 30 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Живые деньги (min)",
            dataIndex: "realMoneyMin",
            width: 92,
            sorter: {
                compare: (a, b) => a.realMoneyMin.replace(/%/, "") - b.realMoneyMin.replace(/%/, ""),
                multiple: 6,
            },
            render: number => (
                Number(number.replace(/%/, "")) > 30 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Дыра капитала",
            dataIndex: "capitalHole",
            defaultSortOrder: 'ascend',
            width: 106,
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
            width: 106,
            sorter: {
                compare: (a, b) => a.loanQuality - b.loanQuality,
                multiple: 4,
            },
            render: number => (
                number < 60 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Аппетит к риску",
            dataIndex: "appetiteRisk",
            width: 99,
            sorter: {
                compare: (a, b) => a.appetiteRisk.replace(/%/, "") - b.appetiteRisk.replace(/%/, ""),
                multiple: 3,
            },
            render: number => (
                Number(number.replace(/%/, "")) < 70 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Доля рынка",
            dataIndex: "marketShare",
            width: 85,
            sorter: {
                compare: (a, b) => a.marketShare.replace(/%/, "") - b.marketShare.replace(/%/, ""),
                multiple: 9,
            },
            render: number => (
                Number(number.replace(/%/, "")) > 2 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Доля ритейла",
            dataIndex: "retailShare",
            width: 98,
            sorter: {
                compare: (a, b) => a.retailShare.replace(/%/, "") - b.retailShare.replace(/%/, ""),
                multiple: 4,
            },
            render: number => (
                Number(number.replace(/%/, "")) > 20 ?
                    <span style={{ color: 'green' }}>{number}</span>
                    :
                    <span style={{ color: 'red' }}>{number}</span>
            ),
        },
        {
            title: "Бумажные",
            children: [
                {
                    title: "NPL",
                    dataIndex: "npl",
                    width: 70,
                    sorter: {
                        compare: (a, b) => a.npl.replace(/%/, "") - b.npl.replace(/%/, ""),
                        multiple: 6,
            },
                },
                {
                    title: "Капитал",
                    dataIndex: "capital",
                    width: 99,
                    sorter: {
                        compare: (a, b) => a.capital.replace(/%/, "") - b.capital.replace(/%/, ""),
                        multiple: 2,
            },
                },
                {
                    title: "Профит",
                    dataIndex: "profit",
                    width: 96,
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
            width: 93,
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
            width: 94,
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
    const [owner, setOwner] = useState([])

    async function fetchBanks() {
        const banksRef = collection(db, "banks");
        const querySnapshot = await getDocs(banksRef);
        querySnapshot.forEach((doc) => {
            setData(prev => [...prev, doc.data()]);
        });
    }

    async function fetchOwners() {
        const ownersRef = collection(db, "owners");
        const querySnapshot = await getDocs(ownersRef);
        querySnapshot.forEach((doc) => {
            setOwner(prev => [...prev, doc.data()]);
        });
    }

    function getOwner(name) {
        let flag = false
        let ownerName = null
        let officialName = null
        for (let i in owner) {
            if (owner[i].id == name) {
               flag = true
                ownerName = owner[i].name
                officialName = owner[i].official
            } 
        }

        if (flag === true) {
            return (
                <Popover content={ownerName}>
                    <span className="ownerName" style={{ display: 'flex', alignItems: 'center' }}>
                        {officialName}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#1890ff" class="bi bi-info-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                    </span>
                </Popover>
            )
        } else {
            return (
                <span>{name}</span>
            )
        }
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
        fetchOwners()
    }, [])

    return (
        <div className="home">
            <Table 
                columns={columns} 
                dataSource={data} 
                onChange={onChange} 
                showSorterTooltip={false} 
                pagination={false} 
                scroll={{ y: 700 }}
                summary={pageData => {
                    let totalCapitalization = 0;
                    let totalRealMoney = 0;
                    let totalRealMoneyMin = 0;
                    let totalLoanQuality = 0;
                    pageData.forEach((item) => {
                        totalCapitalization += Number(item.capitalization);
                        totalRealMoney += Number(item.realMoney.replace(/%/, ""));
                        totalRealMoneyMin += Number(item.realMoneyMin.replace(/%/, ""));
                        totalLoanQuality += Number(item.loanQuality);
                    })
                    return (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell>Все банки</Table.Summary.Cell>
                                <Table.Summary.Cell>{thousandSeparator(totalCapitalization)}</Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell>{(totalRealMoney / pageData.length).toFixed(1)}%</Table.Summary.Cell>
                                <Table.Summary.Cell>{(totalRealMoneyMin / pageData.length).toFixed(1)}%</Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell>{(totalLoanQuality / pageData.length).toFixed(1)}</Table.Summary.Cell>
                                <Table.Summary.Cell></Table.Summary.Cell>
                                <Table.Summary.Cell>100%</Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )
                }}
            />
        </div>
    )
}

export default Home