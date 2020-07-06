import React, { Component } from 'react';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { Services } from './Services';
import { SLAestimation } from './SLAestimation';
import { ServiceAlert } from './ServiceAlert';

export class MainPanel extends Component {

    constructor(props) {
        super(props);

        const slaEstimation = JSON.parse(localStorage.getItem('slaEstimation')) || [];
        const slaTotal = this.calculateSla(slaEstimation);
        const downTime = this.calculateDownTime(slaTotal)


        this.state = {
            serviceCategories: [], selectedServices: [], selectedCategory: "",
            slaEstimation: slaEstimation,
            slaTotal: slaTotal,
            downTime: downTime,
            addServiceClass: "addservice-alert-hide",
            filter: false, loading: true
        };
        this.selectCategory = this.selectCategory.bind(this);
        this.selectService = this.selectService.bind(this);
        this.searchTextEnter = this.searchTextEnter.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.deleteEstimationEntry = this.deleteEstimationEntry.bind(this);
        this.deleteAll = this.deleteAll.bind(this);
        this.expandAll = this.expandAll.bind(this);
        this.collapseAll = this.collapseAll.bind(this);
        this.expandCollapseEstimation = this.expandCollapseEstimation.bind(this);
    }

    selectCategory(selectedCategory) {
        this.setState({
            selectedServices: selectedCategory.services,
            selectedCategory: selectedCategory.categoryName
        });
    }

    clearSearch(evt) {
        evt.currentTarget.parentElement.children[0].value = "";

        let displayServices = this.state.allservices.filter(o => o.categoryName === this.state.selectedCategory);

        this.setState({
            selectedServices: displayServices,
            filter: false
        });
    }

    searchTextEnter(textValue) {
        let displayServices = [];
        let filter = false;

        if (textValue.length > 0) {
            displayServices = this.state.allservices.filter(o => o.name.toLowerCase().includes(textValue.toLowerCase()));
            filter = true;
        }
        else {
            displayServices = this.state.allservices.filter(o => o.categoryName === this.state.selectedCategory);
        }

        this.setState({
            selectedServices: displayServices,
            filter: filter
        });
    }

    calculateSla(slaEstimation) {
        if (slaEstimation.length == 1)
            return slaEstimation[0].key.sla;

        let total = 1;
        let services = slaEstimation.map(x => x.key);

        for (var i = 0; i < services.length; i++) {
            total = total * services[i].sla / 100;
        }

        return Math.round(((total * 100)  + Number.EPSILON) * 1000) / 1000;
    }

    calculateDownTime(sla) {
        if (sla == 0)
            return 0;

        return Math.round((44640 * (1 - (sla / 100)) + Number.EPSILON) * 100) / 100;
    }

    selectService(selectedService) {

        const service = this.state.selectedServices.find(o => o.name === selectedService);
        const slaEstimation = [...this.state.slaEstimation];

        slaEstimation.push({ id: this.state.slaEstimation.length, key: service });

        const slaTotal = this.calculateSla(slaEstimation);
        const downTime = this.calculateDownTime(slaTotal)

        this.setState({ addServiceClass: "addservice-alert-visible" });

        setTimeout(() => {
            this.setState({ addServiceClass: "addservice-alert-hide" });
        }, 1000);

        this.setState({
            selectedService: selectedService,
            slaEstimation: slaEstimation,
            slaTotal: slaTotal,
            downTime: downTime
        });

        localStorage.setItem('slaEstimation', JSON.stringify(slaEstimation));
    }

    deleteEstimationEntry(evt) {
        const estimationId = evt.currentTarget.parentElement.parentElement.id;
        const slaEstimation = [...this.state.slaEstimation];
        const slaEstimationEntry = slaEstimation.find(e => e.id === Number(estimationId));

        const index = slaEstimation.indexOf(slaEstimationEntry);

        slaEstimation.splice(index, 1);
        const slaTotal = this.calculateSla(slaEstimation);
        const downTime = this.calculateDownTime(slaTotal)

        this.setState({
            slaEstimation: slaEstimation,
            slaTotal: slaTotal,
            downTime: downTime
        });

        localStorage.setItem('slaEstimation', JSON.stringify(slaEstimation));
    }

    deleteAll() {
        this.setState({
            slaEstimation: [],
            slaTotal: 0,
            downTime: 0
        });

        localStorage.setItem('slaEstimation', JSON.stringify([]));
    }

    expandAll(evt) {
        var divPanel = evt.currentTarget.parentElement.parentElement.children[1];
        divPanel.className = "div-show";
    }

    collapseAll(evt) {
        var divPanel = evt.currentTarget.parentElement.parentElement.children[1];
        divPanel.className = "div-hide";
    }

    expandCollapseEstimation(evt) {
        var updownimage = evt.currentTarget;
        var divPanel = evt.currentTarget.parentElement.parentElement.parentElement.children[2];
        divPanel.className = divPanel.className === "div-hide" ? "estimation-layout" : "div-hide";
        updownimage.className = updownimage.className === "up-arrow" ? "down-arrow" : "up-arrow";
    }

    componentDidMount() {
        this.populateServiceCategoryData();
    }

    renderMainPanel() {
        return (
            <div className="main-panel">
                <div className="top-panel">
                    <div className="top-title">
                        <h1 className="top-title-inner">SLA Estimator</h1>
                        <p className="top-title-inner-sub">Estimate the oeverall service level agreement of your services</p>
                    </div>
                    <div className="search-container">
                        <SearchBar onTextSearchEnter={this.searchTextEnter} onClearSearch={this.clearSearch} />
                    </div>
                    <div>
                        <div className="tier-label">
                            Tier
                        </div>
                        <div className="tier-option-div">
                            <select className="tier-option">
                                <option value="1">Global</option>
                                <option value="2">Web</option>
                                <option value="3">Api</option>
                                <option value="4">Data</option>
                                <option value="5">Security</option>
                                <option value="6">Network</option>
                            </select>
                        </div>
                        <div className="regions-label">
                            Deploy to multiple Regions
                        </div>
                        <div className="regions-option-div">
                            <select className="regions-option">
                                <option value="1">Yes</option>
                                <option value="2">No</option>
                            </select>
                        </div>
                    </div>
                    <ServiceAlert id="serviceAlert" className={this.state.addServiceClass} />
                    <div className="layout-parent-div">
                        <div className={!this.state.filter ? "layout-div-left" : "div-hide"}>
                            <Navigation visible={!this.state.filter} dataSource={this.state.serviceCategories} selectedCategory={this.state.selectedCategory} onSelectCategory={this.selectCategory} />
                        </div>
                        <div className={this.state.filter ? "layout-div-center" : "layout-div-right"}>
                            <Services dataSource={this.state.selectedServices} onSelectService={this.selectService} />
                        </div>
                    </div>
                </div>
                <div className="sla-estimation-panel">
                    <SLAestimation dataSource={this.state.slaEstimation} onDeleteEstimation={this.deleteEstimationEntry}
                        onDeleteAll={this.deleteAll} onExpandAll={this.expandAll} onCollapseAll={this.collapseAll}
                        onExpandCollapseEstimation={this.expandCollapseEstimation} slaTotal={this.state.slaTotal}
                        downTime={this.state.downTime} />
                </div>
            </div>
        );
    }

    render() {
        let contents = this.renderMainPanel();

        return (
            <div>
                {contents}
            </div>
        );
    }

    async populateServiceCategoryData() {
        const response = await fetch('servicecategory');
        const data = await response.json();

        const allservices = data.map(x => x.services).reduce(
            (x, y) => x.concat(y));

        this.setState({ serviceCategories: data, allservices, selectedServices: data[0].services, selectedCategory: data[0].categoryName, loading: false });
    }
}
