import React, { useState, memo } from 'react';
import { Table, Container, Segment, Input } from 'semantic-ui-react';

const concerts = require('./concerts.json')
  .reduce((carry, { artist, venue, date, concert }) => {
    const previousEntry = carry.find(dataset => dataset.artist === artist);

    if (!previousEntry) {
      return carry.concat({ artist, shows: [{ venue, date, concert }] });
    }

    return carry.map(dataset => {
      if (dataset.artist === artist) {
        return {
          ...dataset,
          shows: dataset.shows.concat({ venue, date, concert }),
        };
      }

      return dataset;
    });
  }, [])
  .sort((a, b) =>
    new Date(a.shows[0].date) < new Date(b.shows[0].date) ? 1 : -1,
  )
  .map(dataset => ({ ...dataset, shows: dataset.shows.reverse() }));

const ArtistAnchor = ({ artist }) => (
  <a
    href={`//last.fm/music/${artist}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {artist}
  </a>
);

const Row = memo(
  ({ date, artist, amountOfShows, venue, concert, isFirstShow }) => {
    const timestamp = new Date(date);
    const isUpcoming = timestamp.getTime() > now;

    return (
      <Table.Row positive={isUpcoming}>
        {isFirstShow && (
          <td rowSpan={amountOfShows}>
            <ArtistAnchor artist={artist} />
          </td>
        )}
        <td>
          <time dateTime={date}>{timestamp.toLocaleDateString()}</time>
        </td>
        <td>{venue}</td>
        <td>{concert}</td>
      </Table.Row>
    );
  },
);

const now = Date.now();

const headColumns = ['Artist', 'Date', 'Venue', 'Concert'];

const App = () => {
  const [filter, setFilter] = useState('');

  const handleChange = ({ target }) => {
    const value = target.value.trim().toLowerCase();

    if (filter === value) {
      return;
    }

    setFilter(value);
  };

  const filteredConcerts =
    filter.length > 0
      ? concerts.filter(
          ({ artist }) => artist.toLowerCase().indexOf(filter) > -1,
        )
      : concerts;

  const amountOfShows = filteredConcerts.reduce(
    (carry, { shows: { length } }) => carry + length,
    0,
  );

  return (
    <Segment>
      <Container>
        <Table
          striped
          selectable
          compact
          size="small"
          basic="very"
          color="yellow"
        >
          <thead>
            <tr>
              {headColumns.map(title => (
                <th key={title}>{title}</th>
              ))}
            </tr>
            <tr>
              <td colSpan={4}>
                <Input
                  type="search"
                  size="small"
                  placeholder="Filter artists..."
                  autoFocus
                  icon={{ name: 'search', circular: true, link: true }}
                  fluid
                  onChange={handleChange}
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {filteredConcerts.map(({ shows, artist }) =>
              shows.map(({ date, venue, concert }) => (
                <Row
                  {...{
                    date,
                    artist,
                    venue,
                    concert,
                    isFirstShow:
                      shows.findIndex(show => show.date === date) === 0,
                    amountOfShows: shows.length,
                  }}
                  key={`${date}-${artist}`}
                />
              )),
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                {[
                  filteredConcerts.length,
                  filteredConcerts.length > 1 || filteredConcerts.length === 0
                    ? 'artists'
                    : 'artist',
                ].join(' ')}
              </td>
              <td colSpan={2}>
                {[
                  amountOfShows,
                  amountOfShows > 1 || amountOfShows === 0 ? 'shows' : 'show',
                ].join(' ')}
              </td>
            </tr>
          </tfoot>
        </Table>
      </Container>
    </Segment>
  );
};

export default App;
