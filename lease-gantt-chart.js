/**
 * Created with JetBrains WebStorm.
 * User: weiwang
 * Date: 6/24/14
 * Time: 5:57 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {


    var leaseData = [
        {
            "unitName":"A101",
            "beginTimestamp":1328256000000,
            "endTimestamp":1359978400000,
            "rent":1200
        },
        {
            "unitName":"B201",
            "beginTimestamp":1298966400000,
            "endTimestamp":1398966400000,
            "rent":1300
        },
        {
            "unitName":"A301",
            "beginTimestamp":1275721200000,
            "endTimestamp":1298966400000,
            "rent":1500
        },
        {
            "unitName":"A101",
            "beginTimestamp":1298966400000,
            "endTimestamp":1310664000000,
            "rent":1100
        },
        {
            "unitName":"A301",
            "beginTimestamp":1357878400000,
            "endTimestamp":1369878400000,
            "rent":2000
        }
    ];

// create new set of data structure for rendering chart

    var groupUnitData = _.groupBy(leaseData, 'unitName');
    var uniqueUnitNames = _.sortBy(_.keys(groupUnitData), function (name) {
        return name;
    });
    console.log(JSON.stringify(groupUnitData, null, 4));


    var getLeaseIntervals = function (unitLeases, unitName) {
        // Find highest rent for the unit
        var highestRent = _.max(unitLeases, function (unitLease) {
            return unitLease.rent;
        })['rent'];

        // Get all the intervals for the unit
        var leaseIntervals = [];

        $.each(unitLeases, function (i, unitLeaseVal) {
            leaseIntervals.push({
                    x: unitLeaseVal.beginTimestamp,
                    y: _.indexOf(uniqueUnitNames, unitName),
                    start: unitLeaseVal.beginTimestamp,
                    end: unitLeaseVal.endTimestamp,
                    rent: unitLeaseVal.rent,
                    //label the interval with highest rent
                    label: unitLeaseVal.rent === highestRent ? "Highest Rent: $" + unitLeaseVal.rent + '/month' : null
                },
                {
                    x:unitLeaseVal.endTimestamp,
                    y:_.indexOf(uniqueUnitNames, unitName),
                    start:unitLeaseVal.beginTimestamp,
                    end:unitLeaseVal.endTimestamp,
                    rent:unitLeaseVal.rent
                });
            if (unitLeases[i + 1]) {
                leaseIntervals.push(
                    [(unitLeaseVal.endTimestamp + unitLeases[i + 1].beginTimestamp)/2 , null]
                )
            }
        });

        return leaseIntervals;

    };

    var leaseRent = _.map(groupUnitData, function (unitLeases, unitName) {
        var lease = getLeaseIntervals(
            _.sortBy(unitLeases, function (obj) {
                return obj.beginTimestamp;
            }),
            unitName
        );

        return {
            name:unitName,
            data:lease
        };

    });
    //Sort the data, otherwise Highchart will complain error15
    var series = _.sortBy(leaseRent, function (obj) {
        return obj.name;
    });

    console.log(JSON.stringify(series, null, 4));
//Render Gantt Chart
    var chart = new Highcharts.Chart({
        chart:{
            renderTo:'lease-gantt-chart'
        },
        title:{
            text:'Lease Income'
        },
        xAxis:{
            type:'datetime'
        },
        yAxis:{
            tickInterval:1,
            startOnTick:true,
            endOnTick:false,
            labels:{
                // apartment names
                formatter:function () {
                    if (series[this.value]) {
                        return uniqueUnitNames[this.value];
                    }
                }
            },

            title:{
                text:"Apartment"
            },
            minPadding:0.2,
            maxPadding:0.2

        },
        legend:{
            enabled:false
        },
        tooltip:{
            formatter:function () {
                debugger;
                return '<b>' + uniqueUnitNames[this.y] + ': $' + this.point.options.rent + '/month</b><br/>' +
                    Highcharts.dateFormat('%e, %b', this.point.options.start) +
                    ' - ' + Highcharts.dateFormat('%e, %b', this.point.options.end);
            }
        },
        plotOptions:{
            line:{
                lineWidth:10,
                marker:{
                    enabled:false
                },
                dataLabels:{
                    enabled:true,
                    align:'left',
                    formatter:function () {
                        return this.point.options && this.point.options.label;
                    },
                    borderRadius:5,
                    backgroundColor:"rgba(255,235,205, 0.7)"
                }
            }

        },
        series:series
    });

})();