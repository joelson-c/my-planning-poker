package main

import (
	"ergo.services/ergo/act"
	"ergo.services/ergo/gen"
)

func factory_VoteSocketPool() gen.ProcessBehavior {
	return &VoteSocketPool{}
}

type VoteSocketPool struct {
	act.Pool
}

// Init invoked on a start this process.
func (w *VoteSocketPool) Init(args ...any) (act.PoolOptions, error) {
	var poolOptions act.PoolOptions
	poolOptions.WorkerFactory = factory_VoteSocketWorker
	return poolOptions, nil
}
