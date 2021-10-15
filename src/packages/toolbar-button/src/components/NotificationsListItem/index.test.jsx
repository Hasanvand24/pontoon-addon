/* global browser */
import React from 'react';
import { render, mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { NotificationsListItem } from '.';
import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { BackgroundPontoonMessageType } from '@pontoon-addon/commons/src/BackgroundPontoonMessageType';
import ReactTimeAgo from 'react-time-ago';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

describe('<NotificationsListItem>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('renders', () => {
    const wrapper = mount(
      <NotificationsListItem
        unread={true}
        actor={{anchor: 'ACTOR'}}
        verb="VERB"
        target={{anchor: 'TARGET'}}
        date_iso="1970-01-01T00:00:00Z"
        description={{safe: true, content: 'DESCRIPTION'}}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('unread')).toBe(true);
    expect(wrapper.find('.NotificationsListItem').hasClass('read')).toBe(false);
    expect(wrapper.find('.link').length).toBe(2);
    expect(wrapper.find('.link').first().text()).toBe('ACTOR');
    expect(wrapper.find('.link').last().text()).toBe('TARGET');
    expect(wrapper.find('span').text()).toBe(' VERB ');
    expect(wrapper.find('.NotificationsListItem-timeago').find(ReactTimeAgo).length).toBe(1);
    expect(wrapper.find('.NotificationsListItem-description').text()).toBe('DESCRIPTION');
  });

  it('renders links and formatting tags in description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{anchor: 'ACTOR'}}
        verb="VERB"
        target={{anchor: 'TARGET'}}
        date_iso="1970-01-01T00:00:00Z"
        description={{safe: true, content: 'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>'}}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe('DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>');
  });

  it('linkifies URL in unsafe description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{anchor: 'ACTOR'}}
        verb="VERB"
        target={{anchor: 'TARGET'}}
        date_iso="1970-01-01T00:00:00Z"
        description={{safe: false, content: 'DESCRIPTION WITH A LINK TO https://example.com/'}}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe('<span class="Linkify">DESCRIPTION WITH A LINK TO <a href="https://example.com/" class="link" target="_blank" rel="noopener noreferrer">https://example.com/</a></span>');
  });

  it('prevents XSS in description', () => {
    const wrapper = render(
      <NotificationsListItem
        unread={true}
        actor={{anchor: 'ACTOR'}}
        verb="VERB"
        target={{anchor: 'TARGET'}}
        date_iso="1970-01-01T00:00:00Z"
        description={{safe: true, content: 'DESCRIPTION WITH(OUT) <a onload=alert("XSS")>XSS ATTEMPTS</a> <script>alert("XSS");</script>'}}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem-description').html()).toBe('DESCRIPTION WITH(OUT) <a>XSS ATTEMPTS</a> ');
  });

  it('renders read notification', () => {
    const wrapper = shallow(
      <NotificationsListItem
        unread={false}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('unread')).toBe(false);
    expect(wrapper.find('.NotificationsListItem').hasClass('read')).toBe(true);
  });

  it('actor and target links work', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const targetUrl = 'https://127.0.0.1/target/';
    browser.runtime.sendMessage.withArgs({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
      args: [actorUrl],
    }).resolves(actorUrl);
    browser.runtime.sendMessage.withArgs({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
      args: [targetUrl],
    }).resolves(targetUrl);
    browser.tabs.create.resolves(undefined);

    const wrapper = shallow(
      <NotificationsListItem
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        target={{ url: targetUrl, anchor: 'TARGET' }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('pointer')).toBe(false);
    expect(wrapper.find('.link').length).toBe(2);

    wrapper.find('.link').first().simulate('click', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: actorUrl}).calledOnce).toBe(true);

    wrapper.find('.link').last().simulate('click', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: targetUrl}).calledOnce).toBe(true);
  });

  it('whole item is clickable when only one link is present', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    browser.runtime.sendMessage.withArgs({
      type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PROJECT_URL,
      args: [actorUrl],
    }).resolves(actorUrl);
    browser.tabs.create.resolves(undefined);

    const wrapper = shallow(
      <NotificationsListItem
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.NotificationsListItem').hasClass('pointer')).toBe(true);
    wrapper.find('.NotificationsListItem').simulate('click', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: actorUrl}).calledOnce).toBe(true);
  });

});
