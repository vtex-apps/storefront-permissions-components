import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery } from 'react-apollo'
import { AutocompleteInput } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import { messages } from './customers-admin'
import GET_ORGANIZATIONS from '../queries/listOrganizations.gql'
import GET_ORGANIZATION_BY_ID from '../queries/getOrganization.graphql'

const initialState = {
  status: ['active', 'on-hold', 'inactive'],
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

interface Props {
  onChange: (value: { value: string | null; label: string }) => void
  organizationId: string
}

const OrganizationsAutocomplete = ({ onChange, organizationId }: Props) => {
  const { formatMessage } = useIntl()
  const [term, setTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState(term)

  const [values, setValues] = useState<Array<{ value: string; label: string }>>(
    []
  )

  const { data, loading, refetch } = useQuery(GET_ORGANIZATIONS, {
    variables: initialState,
    ssr: false,
    notifyOnNetworkStatusChange: true,
  })

  const { data: organization, loading: orgLoading } = useQuery(
    GET_ORGANIZATION_BY_ID,
    {
      variables: { id: organizationId },
      ssr: false,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      skip: !organizationId,
    }
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(term)
    }, 500) // 500ms delay

    return () => clearTimeout(handler)
  }, [term])

  useEffect(() => {
    if (debouncedTerm.length > 2) {
      refetch({
        ...initialState,
        search: debouncedTerm,
      })
    } else if (debouncedTerm === '') {
      refetch({
        ...initialState,
        search: '',
      })
    }
  }, [debouncedTerm, refetch])

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (organization?.getOrganizationById) {
      const { name, id } = organization.getOrganizationById

      setTerm(name)

      onChange({ value: id, label: name })
    }
  }, [organization, onChange])

  useEffect(() => {
    if (data?.getOrganizations?.data) {
      setValues(
        data.getOrganizations.data.map(
          (item: { id: string; name: string }) => ({
            value: item.id,
            label: item.name,
          })
        )
      )
    }
  }, [data])

  const onClear = useCallback(() => {
    setTerm('')

    refetch({
      ...initialState,
      search: '',
    })
    onChange({ value: null, label: '' })
  }, [onChange, refetch])

  const options = useMemo(
    () => ({
      maxHeight: 250,
      onSelect: onChange,
      loading,
      value: values,
    }),
    [loading, values, onChange, orgLoading]
  )

  const input = useMemo(
    () => ({
      onChange: (_term: string) => setTerm(_term),
      onClear,
      placeholder: formatMessage(messages.searchOrganizations),
      value: term,
    }),
    [term, onClear, formatMessage]
  )

  return <AutocompleteInput input={input} options={options} />
}

export default OrganizationsAutocomplete
