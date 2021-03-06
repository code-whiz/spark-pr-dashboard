define([
    'react',
    'jquery',
    'underscore',
    'views/Dashboard',
    'mixins/UrlMixin'
  ],
  function(React, $, _, Dashboard, UrlMixin) {
    "use strict";

    var StaleNavigationItem = React.createClass({
      mixins: [UrlMixin],
      onClick: function(event) {
        var hash = window.location.hash.split(/#|&/);
        var curComponent = hash.pop();
        var component = curComponent ? curComponent : "all";
        this.pushAnchor(component, this.props.opt);
      },

      render: function() {
        var opt = this.props.opt;
        return (
          <li className={opt === this.props.activeOpt ? "subnav-active" : ""}>
            <a onClick={this.onClick}>
              {opt + " (" + this.props.prsByOpt[opt].length + ")"}
            </a>
          </li>
        );
      }
    });

    var StaleDashboard = React.createClass({
      mixins: [UrlMixin],
      getInitialState: function() {
        return {prs: [], stalePrs: [], staleOpt: '', prsByOpt: {}};
      },

      componentDidMount: function() {
        if (this.props.prs.length > 0) {
          this._prepareData(this.props.prs);
        }
      },

      componentWillReceiveProps: function(nextProps) {
        this._prepareData(nextProps.prs);
      },

      componentDidUpdate: function(prevProps, prevState) {
        var newStaleOpt = this.state.staleOpt;
        if (prevState.staleOpt !== newStaleOpt || prevState.stalePrs !== this.state.stalePrs) {
          this.setState({
            staleOpt: newStaleOpt,
            stalePrs: this.state.prsByOpt[newStaleOpt] || []
          });
        }
      },

      _prepareData: function(prs) {
        var prsByOpt = {}, allOpt = "All", hangOpt = "Hanging", abandOpt = "Abandoned";
        prsByOpt[allOpt] = [];
        prsByOpt[hangOpt] = [];
        prsByOpt[abandOpt] = [];

        for (var i = 0; i < prs.length; i++) {
          var pr = prs[i];
          if (pr.commenters.length === 0 || pr.commenters[0].username === pr.user) {
            prsByOpt[hangOpt].push(pr);
          } else {
            prsByOpt[abandOpt].push(pr);
          }
          prsByOpt[allOpt].push(pr);
        }

        var curOpt = this._checkOptAvailability(prsByOpt);

        this.setState({
          stalePrs: prs,
          staleOpt: curOpt ? curOpt : allOpt,
          prsByOpt: prsByOpt
        });
      },

      _checkOptAvailability: function(prsByOpt) {
        var hash = window.location.hash.split(/#|&/);
        hash.pop(); // pop component off
        var anchor = hash.pop();

        for (var opt in prsByOpt) {
          if (this.getAnchor(opt) === anchor) {
            return opt;
          }
        }
      },

      render: function() {
        var navigationItems = [],
          prsByOpt = this.state.prsByOpt;

        for (var opt in prsByOpt) {
          navigationItems.push(
            <StaleNavigationItem
              prsByOpt={prsByOpt}
              activeOpt={this.state.staleOpt}
              opt={opt}/>);
        }

        var staleNavigation = (
          <nav className="sub-nav navbar navbar-default" role="navigation">
            <div className="container-fluid">
              <ul className="nav navbar-nav">
                {navigationItems}
              </ul>
            </div>
          </nav>
        );

        var dashboard = (
          <Dashboard
            prs={this.state.stalePrs}
            showJenkinsButtons={this.props.showJenkinsButtons}/>
        );

        return (
          <div className="stale-dash">
            {staleNavigation}
            {dashboard}
          </div>
        );
      }
    });


    return StaleDashboard;
  }
);
