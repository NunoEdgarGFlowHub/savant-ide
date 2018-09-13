import * as React from 'react';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import EventDialog from './EventDialog';
import { clearEvent } from '../../store/contract/actions';
import { Event } from '../../store/contract/types';

interface Props {
  clearEvent: typeof clearEvent;
  events: { [id: string]: Event };
}

interface State {
  anchor: HTMLElement | null;
  selectedEvent: string;
  isDialogOpen: boolean;
}

export default class EventAlerts extends React.Component<Props, State> {
  state: State = {
    anchor: null,
    isDialogOpen: false,
    selectedEvent: '',
  };

  onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    this.setState({ anchor: e.currentTarget });
  };

  onOpenDialog: ((id: string) => React.MouseEventHandler<HTMLLIElement>) = (id: string) => (e) => {
    e.preventDefault();
    this.setState({ isDialogOpen: true, selectedEvent: id, anchor: null });
  };

  onCloseDialog: React.MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    this.setState({ isDialogOpen: false });
  };

  onClearEvent: ((id: string) => React.MouseEventHandler<HTMLButtonElement>) = (id: string) => (
    e,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.clearEvent(id);
    this.setState({ anchor: null });
  };

  onClose: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    this.setState({ anchor: null });
  };

  renderBadge = () => {
    const { events } = this.props;
    const len = Object.keys(events).length;

    return len ? (
      <IconButton onClick={this.onClick}>
        <Badge badgeContent={len} color="primary">
          <MailIcon />
        </Badge>
      </IconButton>
    ) : (
      <IconButton disabled>
        <MailIcon />
      </IconButton>
    );
  };

  render() {
    const { events } = this.props;

    return (
      <div>
        {this.renderBadge()}
        <Menu
          id="event-alerts-menu"
          anchorEl={this.state.anchor}
          open={!!this.state.anchor}
          onClose={this.onClose}
        >
          {Object.keys(events).map((id) => (
            <MenuItem onClick={this.onOpenDialog(id)} key={id}>
              <Typography>
                {`${events[id].name} (${events[id].address}): ${events[id].event._eventname}`}
              </Typography>
              <IconButton aria-label="save" color="primary" onClick={this.onClearEvent(id)}>
                <CloseIcon />
              </IconButton>
            </MenuItem>
          ))}
        </Menu>
        <EventDialog
          open={this.state.isDialogOpen}
          onClose={this.onCloseDialog}
          event={events[this.state.selectedEvent]}
        />
      </div>
    );
  }
}
