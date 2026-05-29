/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  name: string;
  comment: string;
  stars: number;
  date: string;
  isCustom?: boolean;
}
