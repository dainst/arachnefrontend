# Visualizations

Notes on the visualizations.

## Network visualization

The following directives can be used standalone:

* con10t-time-line-chart
* con10t-paginated-item-list
* con10t-network-map
* con10t-network-chord

As an alternative, the directives listed above can be used in conjunction using the directive:
* con10t-network

The complete hierarchy would then look like this:
* con10t-network
    * con10t-time-line-chart
    * con10t-paginated-item-list
    * con10t-network-map
        * con10t-network-map-popup
    * con10t-network-chord

For an example see: [Demo](https://arachne.dainst.org/project/network_visualization_demo).
