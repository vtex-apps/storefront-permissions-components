/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from 'react'
import React, { useState } from 'react'
import { useIntl, defineMessages } from 'react-intl'
import { useQuery, useMutation, useLazyQuery } from 'react-apollo'
import { Card, Button, Dropdown, Alert, Spinner } from 'vtex.styleguide'

import OrganizationsAutocomplete from './OrganizationsAutocomplete'
import GET_USER from '../queries/getUser.gql'
import GET_ROLES from '../queries/ListRoles.gql'
import GET_COST from '../queries/costCentersByOrg.gql'
import SAVE_USER from '../mutations/saveUser.gql'
import DELETE_USER from '../mutations/deleteUser.gql'

const messages = defineMessages({
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

  const {
    data: userData,
    loading,
    refetch,
  } = useQuery(GET_USER, {
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

  const { loading: loadingRoles, data: dataRoles } = useQuery(GET_ROLES)

  const [saveUser, { loading: saveUserLoading }] = useMutation(SAVE_USER)

  const [deleteUser, { loading: deleteUserLoading }] = useMutation(DELETE_USER)

  const [getCostCenter, { data: dataCostCenter, called }] =
    useLazyQuery(GET_COST)

  const onMutationError = () => {
    setState({
      ...state,
      message: 'error',
    })
  }

  const handleSaveUser = () => {
    const variables = {
      id: state.id,
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
      })
      .catch(onMutationError)
  }

  const handleDeleteUser = () => {
    const variables = {
      id: state.id,
      userId: state.userId,
      email: state.email,
    }

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
      })
      .catch(onMutationError)
  }

  const optionsCost = parseOptions(
    dataCostCenter?.getCostCentersByOrganizationId
  )

  const roleOptions =
    dataRoles?.listRoles?.map((role: any) => {
      return {
        value: role.id,
        label: role.name,
      }
    }) ?? []

  if (state.costId && !called) {
    getCostCenter({
      variables: {
        id: state.orgId,
      },
    })
  }

  if (loading || loadingRoles) {
    return (
      <div className="w-100 pt6">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="w-100 pt6">
      <Card>
        <h5 className="t-heading-5 fw4 mt1 mb6">
          {formatMessage(messages.b2bInfo)}
        </h5>
        {showName && <div className="mb5">{state.name}</div>}
        {showEmail && <div className="mb5">{state.email}</div>}
        {roleOptions.length > 1 && (
          <div className="mb5 w-80">
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
              <div className="mr2 w-80">
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
          <div className="mb5 w-80">
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
            {formatMessage(messages.save)}
          </Button>
          {userData?.getUser?.roleId && (
            <div className="ml3">
              <Button
                variation="danger"
                disabled={loading || saveUserLoading || deleteUserLoading}
                onClick={() => {
                  handleDeleteUser()
                }}
              >
                {formatMessage(messages.delete)}
              </Button>
            </div>
          )}
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
      </Card>
    </div>
  )
}

export default UserEdit
