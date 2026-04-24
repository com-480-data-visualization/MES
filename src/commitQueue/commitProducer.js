export async function startCommitProducer(api, owner, repo, queue, signal) {
    await api.fetchCommitsIntoQueue(owner, repo, queue, { signal });
}
