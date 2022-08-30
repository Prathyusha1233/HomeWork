import React, { useState, useEffect } from "react";
import fetch from "./api/dataService";
import ReactTable from "react-table";
import "./App.css";
import _ from "lodash";

function calculateResults(incomingData) {
  // Calculate points per transaction

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const pointsPerTransaction = incomingData.map((transaction) => {
    let points = 0;
    let over50 = 0;
    let over100 = transaction.amt - 100;

    if (over100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction
      points += over100 * 2;
    }
    if (transaction.amt > 50) {
      console.log(transaction.amt, "&&&&&&&&&&&&&7");
      if (transaction.amt > 100) {
        let gtVal = transaction.amt - over100;
        over50 = gtVal - 50;
      } else {
        over50 = transaction.amt - 50;
      }
    }

    if (over50 > 0) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += over50 * 1;
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach((pointsPerTransaction) => {
    let { custid, name, month, points } = pointsPerTransaction;
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];
    }
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;
    } else {
      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points,
      };
    }
  });
  let tot = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach((cRow) => {
      tot.push(cRow);
    });
  }
  //console.log("byCustomer", byCustomer);
  //console.log("tot", tot);
  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey],
    });
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer: totByCustomer,
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: "Customer",
      accessor: "name",
    },
    {
      Header: "Month",
      accessor: "month",
    },
    {
      Header: "# of Transactions",
      accessor: "numTransactions",
    },
    {
      Header: "Reward Points",
      accessor: "points",
    },
  ];

  function getIndividualTransactions(row) {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, (tRow) => {
      return (
        row.original.custid === tRow.custid &&
        row.original.monthNumber === tRow.month
      );
    });
    return byCustMonth;
  }

  useEffect(() => {
    fetch().then((data) => {
      console.log(data, "%%%%%%%%%%%%%%%%5");
      const results = calculateResults(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return transactionData == null ? (
    <div>Loading...</div>
  ) : (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              defaultPageSize={10}
              columns={columns}
              SubComponent={(row) => {
                return (
                  <div>
                    {getIndividualTransactions(row).map((tran) => {
                      return (
                        <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong>{" "}
                              {tran.transactionDt} - <strong>$</strong>
                              {tran.amt} - <strong>Points: </strong>
                              {tran.points}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
