import { Text } from 'preact-i18n';
import cx from 'classnames';

import EmptyState from './EmptyState';
import style from './style.css';
import AirplayDeviceBox from '../AirplayDeviceBox';
import { connect } from 'unistore/preact';
import { Component } from 'preact';

class DiscoverTab extends Component {
  getDiscoveredDevices = async () => {
    this.setState({
      loading: true
    });
    try {
      const discoveredDevices = await this.props.httpClient.get('/api/v1/service/airplay/discover');
      const existingAirplayDevices = await this.props.httpClient.get('/api/v1/service/airplay/device', {});
      discoveredDevices.forEach(discoveredDevice => {
        const existingDevice = existingAirplayDevices.find(d => d.external_id === discoveredDevice.external_id);
        if (existingDevice) {
          discoveredDevice.alreadyExist = true;
        }
      });
      this.setState({
        discoveredDevices,
        loading: false,
        errorLoading: false
      });
    } catch (e) {
      this.setState({
        loading: false,
        errorLoading: true
      });
    }
  };
  async componentWillMount() {
    this.getDiscoveredDevices();
  }

  render(props, { loading, errorLoading, discoveredDevices }) {
    return (
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">
            <Text id="integration.airplay.discover.title" />
          </h1>
          <div class="page-options d-flex">
            <button onClick={this.getDiscoveredDevices} class="btn btn-outline-primary ml-2" disabled={loading}>
              <Text id="integration.airplay.discover.scan" /> <i class="fe fe-radio" />
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="alert alert-secondary">
            <Text id="integration.airplay.discover.description" />
          </div>
          {errorLoading && (
            <div class="alert alert-danger">
              <Text id="integration.airplay.discover.errorWhileScanning" />
            </div>
          )}
          <div
            class={cx('dimmer', {
              active: loading
            })}
          >
            <div class="loader" />
            <div class={cx('dimmer-content', style.airplayListBody)}>
              <div class="row">
                {discoveredDevices &&
                  discoveredDevices.map((device, index) => (
                    <AirplayDeviceBox saveButton device={device} deviceIndex={index} />
                  ))}
                {!discoveredDevices || (discoveredDevices.length === 0 && <EmptyState />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect('httpClient', {})(DiscoverTab);
