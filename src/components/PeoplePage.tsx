import { PeopleFilters } from './PeopleFilters';
import { Loader } from './Loader';
import { PeopleTable } from './PeopleTable';
import { useEffect, useState } from 'react';
import { Person } from '../types';
import { getPeople } from '../api';
import { useSearchParams } from 'react-router-dom';
import { OrderEnum, SortEnum } from '../types/Order';
import { filterPeople } from '../function/filterFunction';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [peopleUsed, setPeopleUsed] = useState<Person[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const sortField = (searchParams.get('sort') as SortEnum) || '';
  const sortOrder = (searchParams.get('order') as OrderEnum) || '';

  const query = searchParams.get('query') || '';
  const centuries = searchParams.getAll('centuries');
  const sex = searchParams.get('sex') || null;

  useEffect(() => {
    getPeople()
      .then(data => {
        setPeople(data);
        setPeopleUsed(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filteredArr = filterPeople([...people], query, centuries, sex);

    const sortedPeople = [...filteredArr];

    if (sortField) {
      sortedPeople.sort((a, b) => {
        const fieldA = a[sortField as keyof Person];
        const fieldB = b[sortField as keyof Person];

        if (fieldA && fieldB) {
          if (fieldA < fieldB) {
            return sortOrder === OrderEnum.desc ? 1 : -1;
          }

          if (fieldA > fieldB) {
            return sortOrder === OrderEnum.desc ? -1 : 1;
          }
        }

        return 0;
      });
    }

    if (JSON.stringify(sortedPeople) !== JSON.stringify(peopleUsed)) {
      setPeopleUsed(sortedPeople);
    }
  }, [sortField, sortOrder, sex, query, centuries]);

  const handleSort = (field: string) => {
    const currentSortField = searchParams.get('sort');
    const currentSortOrder = searchParams.get('order');
    const params = new URLSearchParams(searchParams);

    if (currentSortField === field) {
      if (currentSortOrder === OrderEnum.asc) {
        params.set('order', OrderEnum.desc);
      } else if (currentSortOrder === OrderEnum.desc) {
        params.delete('sort');
        params.delete('order');
      }
    } else {
      params.set('sort', field);
      params.set('order', OrderEnum.asc);
    }

    setSearchParams(params);
  };

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          {!loading && !error && people.length >= 0 && (
            <div className="column is-7-tablet is-narrow-desktop">
              <PeopleFilters
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                sex={sex}
                centuries={centuries}
              />
            </div>
          )}

          <div className="column">
            <div className="box table-container">
              {loading && <Loader />}
              {error && (
                <p data-cy="peopleLoadingError" className="has-text-danger">
                  Something went wrong
                </p>
              )}

              {people.length <= 0 && !loading && (
                <p data-cy="noPeopleMessage">
                  There are no people on the server
                </p>
              )}
              {!peopleUsed.length && (
                <p>There are no people matching the current search criteria</p>
              )}
              {!loading && !error && peopleUsed.length > 0 && (
                <PeopleTable people={peopleUsed} onSort={handleSort} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
