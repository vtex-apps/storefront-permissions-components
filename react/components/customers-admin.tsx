/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from 'react'
import React, { Fragment, useState } from 'react'
import { useIntl, defineMessages } from 'react-intl'
import { useQuery, useMutation, useLazyQuery } from 'react-apollo'
import {
  Button,
  Dropdown,
  Alert,
  Spinner,
  Tabs,
  Tab,
  Table,
} from 'vtex.styleguide'

import OrganizationsAutocomplete from './OrganizationsAutocomplete'
import GET_USER from '../queries/getUser.gql'
import GET_ROLES from '../queries/ListRoles.gql'
import GET_COST from '../queries/costCentersByOrg.gql'
import GET_ORGANIZATIONS from '../queries/getOrganizationsByEmail.graphql'
import ADD_USER from '../mutations/addUser.gql'
import DELETE_USER from '../mutations/deleteUser.gql'

export const messages = defineMessages({
  b2bInfo: {
    id: 'admin/storefront-permissions.b2bInfo.title',
    defaultMessage: 'B2B Information',
  },
  role: {
    id: 'admin/storefront-permissions.tab.roles.name.label',
    defaultMessage: 'Role',
  },
  canImpersonate: {
    id: 'admin/storefront-permissions.tab.users.canImpersonate.label',
    defaultMessage: 'Can impersonate',
  },
  name: {
    id: 'admin/storefront-permissions.tab.users.name.label',
    defaultMessage: 'Name',
  },
  email: {
    id: 'admin/storefront-permissions.tab.users.email.label',
    defaultMessage: 'Email',
  },
  organization: {
    id: 'admin/storefront-permissions.tab.users.organization.label',
    defaultMessage: 'Organization',
  },
  costCenter: {
    id: 'admin/storefront-permissions.tab.users.costCenter.label',
    defaultMessage: 'Cost Center',
  },
  required: {
    id: 'admin/storefront-permissions.required',
    defaultMessage: 'Required',
  },
  cancel: {
    id: 'admin/storefront-permissions.button.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'admin/storefront-permissions.button.save',
    defaultMessage: 'Save',
  },
  add: {
    id: 'admin/storefront-permissions.button.add',
    defaultMessage: 'Add',
  },
  remove: {
    id: 'admin/storefront-permissions.button.remove',
    defaultMessage: 'Remove',
  },
  options: {
    id: 'admin/storefront-permissions.label.options',
    defaultMessage: 'Options',
  },
  b2bRoles: {
    id: 'admin/storefront-permissions.label.b2bRoles',
    defaultMessage: 'B2b Roles',
  },
  addNew: {
    id: 'admin/storefront-permissions.button.addNew',
    defaultMessage: 'Add New',
  },
  delete: {
    id: 'admin/storefront-permissions.button.delete',
    defaultMessage: 'Remove B2B Info',
  },
  success: {
    id: 'admin/storefront-permissions.tab.users.success',
    defaultMessage: 'B2B info saved',
  },
  alertPick: {
    id: 'admin/storefront-permissions.alert-pick',
    defaultMessage:
      'You need to pick a cost center before you can save changes',
  },
  error: {
    id: 'admin/storefront-permissions.tab.users.error',
    defaultMessage: 'Error saving B2B info',
  },
  searchOrganizations: {
    id: 'admin/storefront-permissions.searchOrganizations',
    defaultMessage: 'Search organizations...',
  },
})

const parseOptions = (options: any) => {
  return (
    options?.data?.map((orgOrCostCenter: any) => {
      return {
        value: orgOrCostCenter.id,
        label: orgOrCostCenter.name,
      }
    }) ?? []
  )
}

const initialState = {
  message: null,
  id: null,
  roleId: null,
  orgId: null,
  costId: null,
  userId: null,
  clId: null,
  name: null,
  email: null,
  canImpersonate: false,
  organizationName: null,
}

const UserEdit: FC<any> = (props: any) => {
  const { formatMessage } = useIntl()
  const {
    id,
    name = null,
    email = null,
    showName,
    showEmail,
    showCancel,
    onCancel,
    onSave,
  } = props

  const [state, setState] = useState<any>({
    ...initialState,
    clId: id,
    name,
    email,
  })

  const [tabs, setTabs] = useState(0)
  const [organizations, setOrganizations] = useState([] as any)
  const [isRemoving, setIsRemoving] = useState(false)

  const { loading, refetch } = useQuery(GET_USER, {
    skip: !id,
    variables: {
      id,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (res: any) => {
      setState({
        ...state,
        ...res.getUser,
      })
    },
  })

  const handleTabs = (tab: number) => {
    setTabs(tab)
    setState({
      ...state,
      message: null,
    })
  }

  const { refetch: refetchOrganizations, loading: loadingOrganizations } =
    useQuery(GET_ORGANIZATIONS, {
      variables: {
        email,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onCompleted: (res: any) => {
        const result = res.getOrganizationsByEmail?.map((organization: any) => {
          return {
            ...organization,
            role: organization.role.name,
          }
        })

        if (result.length === 0) {
          handleTabs(1)
        }

        setOrganizations(result)
      },
    })

  const { loading: loadingRoles, data: dataRoles } = useQuery(GET_ROLES)

  const [saveUser, { loading: saveUserLoading }] = useMutation(ADD_USER)

  const [deleteUser, { loading: deleteUserLoading }] = useMutation(DELETE_USER)

  const [
    getCostCenter,
    { data: dataCostCenter, called, loading: loadingCostCenters },
  ] = useLazyQuery(GET_COST)

  const onMutationError = () => {
    setState({
      ...state,
      message: 'error',
    })
  }

  const roleOptions =
    dataRoles?.listRoles?.map((role: any) => {
      return {
        value: role.id,
        label: role.name,
      }
    }) ?? []

  const optionsCost = parseOptions(
    dataCostCenter?.getCostCentersByOrganizationId
  )

  const handleSaveUser = () => {
    const variables = {
      clId: state.clId,
      userId: state.userId,
      roleId: state.roleId,
      orgId: state.orgId,
      costId: state.costId,
      name: state.name,
      email: state.email,
      canImpersonate: state.canImpersonate,
    }

    saveUser({
      variables,
    })
      .then((res) => {
        if (onSave) {
          onSave()
        }

        setState({
          ...state,
          id: state.id ?? res?.data?.saveUser?.id,
          message: 'success',
        })
        refetchOrganizations()
        setOrganizations([
          ...organizations,
          {
            ...variables,
            role: roleOptions.find((role: any) => role.roleId === state.roleId)
              ?.name,
            organizationName: state.organizationName,
            costCenterName: optionsCost.find(
              (costCenter: any) => costCenter.id === state.costId
            )?.name,
          },
        ])
      })
      .catch(onMutationError)
  }

  const handleDeleteUser = (userData: any) => {
    const variables = {
      id: userData.id,
      userId: userData.userId,
      email: state.email,
      clId: userData.clId,
    }

    setIsRemoving(true)

    deleteUser({
      variables,
    })
      .then((res) => {
        if (onSave) {
          onSave()
        }

        setState({
          ...state,
          roleId: null,
          orgId: null,
          costId: null,
          id: state.id ?? res?.data?.deleteUser?.id,
          message: 'success',
        })
        refetch()
        refetchOrganizations()
      })
      .catch(onMutationError)
      .finally(() => {
        setIsRemoving(false)
      })
  }

  if (state.costId && !called) {
    getCostCenter({
      variables: {
        id: state.orgId,
      },
    })
  }

  if (loading || loadingRoles || loadingCostCenters) {
    return (
      <div className="w-100 pt6 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const customSchema = {
    properties: {
      role: {
        title: formatMessage(messages.role),
      },
      organizationName: {
        title: formatMessage(messages.organization),
      },
      costCenterName: {
        title: formatMessage(messages.costCenter),
      },
      options: {
        title: formatMessage(messages.options),
        // you can customize cell component render (also header component with headerRenderer)
        cellRenderer: ({ rowData }: any) => {
          return (
            <Fragment>
              <div className="mt2 mb2">
                <Button
                  variation="danger"
                  size="small"
                  disabled={isRemoving}
                  onClick={() => handleDeleteUser(rowData)}
                >
                  {formatMessage(messages.remove)}
                </Button>
              </div>
            </Fragment>
          )
        },
      },
    },
  }

  return (
    <div className="w-100 pt6">
      <Tabs fullWidth className="mb4">
        <Tab
          active={tabs === 0}
          label={formatMessage(messages.b2bRoles)}
          onClick={() => handleTabs(0)}
        />
        <Tab
          active={tabs === 1}
          label={formatMessage(messages.addNew)}
          onClick={() => handleTabs(1)}
        />
      </Tabs>
      <div className="pa7">
        {tabs === 0 ? (
          <Fragment>
            <Table
              loading={loadingOrganizations || isRemoving}
              fullWidth
              schema={customSchema}
              items={organizations}
            />
          </Fragment>
        ) : (
          <Fragment>
            {showName && <div className="mb5">{state.name}</div>}
            {showEmail && <div className="mb5">{state.email}</div>}
            {roleOptions.length > 1 && (
              <div className="mb5">
                <Dropdown
                  label={formatMessage(messages.role)}
                  options={roleOptions}
                  value={state.roleId}
                  onChange={(_: any, v: string) => {
                    setState({
                      ...state,
                      roleId: v,
                    })
                  }}
                />
              </div>
            )}

            {dataRoles && state.roleId && (
              <div className="mb5 w-100">
                <div className="flex">
                  <div className="w-100">
                    <label className="h-100">
                      <span className="db mt0 mb3 c-on-base t-small">
                        {formatMessage(messages.organization)}
                      </span>
                      <OrganizationsAutocomplete
                        organizationId={state.orgId}
                        onChange={(event) => {
                          if (event.value === state.orgId) {
                            return
                          }

                          setState({
                            ...state,
                            orgId: event.value,
                            costId: null,
                            organizationName: event.label,
                          })
                          if (!event.value) return
                          getCostCenter({
                            variables: {
                              id: event.value,
                            },
                          })
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {state.orgId && (
              <div className="mb5">
                <Dropdown
                  label={formatMessage(messages.costCenter)}
                  options={optionsCost}
                  value={state.costId}
                  onChange={(_: any, costId: string) => {
                    setState({ ...state, costId })
                  }}
                />
              </div>
            )}

            {state.orgId && !state.costId ? (
              <div className="mv4">
                <Alert type="error">{formatMessage(messages.alertPick)}</Alert>
              </div>
            ) : null}

            <div className="mv4 flex justify-start">
              {showCancel && onCancel && (
                <div className="mr3">
                  <Button
                    variation="tertiary"
                    disabled={loading}
                    onClick={() => {
                      onCancel()
                    }}
                  >
                    {formatMessage(messages.cancel)}
                  </Button>
                </div>
              )}
              <Button
                variation="primary"
                disabled={
                  loading ||
                  saveUserLoading ||
                  deleteUserLoading ||
                  !state.name ||
                  !state.email ||
                  !state.orgId ||
                  !state.costId ||
                  !state.roleId
                }
                onClick={() => {
                  handleSaveUser()
                }}
              >
                {formatMessage(messages.add)}
              </Button>
            </div>
            {state.message && (
              <Alert
                type={state.message}
                onClose={() => {
                  setState({ ...state, message: null })
                }}
              >
                {state.message === 'success'
                  ? formatMessage(messages.success)
                  : formatMessage(messages.error)}
              </Alert>
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default UserEdit
